using CostControlSystem.Application.TechnicalServices.Security;

var builder = WebApplication.CreateBuilder(args);


// ===============================
// Configuration
// ===============================

builder.Services
    .AddOptions<JwtSettings>()
    .Bind(builder.Configuration.GetSection("JwtSettings"))
    .ValidateDataAnnotations()
    .ValidateOnStart();


// ===============================
// Services
// ===============================

builder.Services.AddControllers();

// Swagger

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


// ===============================
// Middleware
// ===============================


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
