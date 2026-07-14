using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc;
using CostControlSystem.API.Configuration;
using CostControlSystem.API.Factories;
using CostControlSystem.API.Middleware;
using CostControlSystem.Application.Auth.Interfaces;
using CostControlSystem.Application.Auth.Services;
using CostControlSystem.Application.TechnicalServices.Security;
using CostControlSystem.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// Configuration
// ===============================

builder.Services
    .AddOptions<JwtSettings>()
    .Bind(builder.Configuration.GetSection("JwtSettings"))
    .ValidateDataAnnotations()
    .ValidateOnStart();

// CORS
var corsSettings = builder.Configuration
    .GetSection("Cors")
    .Get<CorsSettings>()
    ?? throw new InvalidOperationException("Cors configuration is missing.");

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(corsSettings.AllowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// ===============================
// Database
// ===============================

builder.Services.AddDbContext<CostControlSystemDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});


// Controllers
builder.Services.AddControllers();


// ===============================
// API Behavior
// ===============================

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value!.Errors.Count > 0)
            .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors
                    .Select(e => e.ErrorMessage)
                    .ToArray());

        var response = ErrorResponseFactory.Create(
            StatusCodes.Status400BadRequest,
            "Validation failed.",
            errors);

        return new BadRequestObjectResult(response);
    };
});


// ===============================
// Authentication
// ===============================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();

                context.Response.StatusCode = StatusCodes.Status401Unauthorized;

                var response = ErrorResponseFactory.Create(
                    StatusCodes.Status401Unauthorized,
                    "Authentication is required.");

                await context.Response.WriteAsJsonAsync(response);
            },

            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;

                var response = ErrorResponseFactory.Create(
                    StatusCodes.Status403Forbidden,
                    "You do not have permission to perform this action.");

                await context.Response.WriteAsJsonAsync(response);
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["JwtSettings:SecretKey"]!)),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["JwtSettings:Audience"],

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
    });


// ===============================
// Dependency Injection
// ===============================

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();

// Technical Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<PasswordHasherService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT access token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


var app = builder.Build();


// ===============================
// Middleware Pipeline
// ===============================

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
