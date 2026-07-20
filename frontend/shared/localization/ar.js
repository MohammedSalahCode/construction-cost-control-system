const ar = {
    app: {
        name: "نظام مراقبة التكاليف",
        subtitle: "مراقبة تكاليف المشاريع ومتابعة الأداء"
    },


    auth: {
        login: {
            title: "تسجيل الدخول",
            email: "البريد الإلكتروني",
            password: "كلمة المرور",
            passwordPlaceholder: "أدخل كلمة المرور",
            rememberMe: "تذكرني",
            signIn: "تسجيل الدخول"
        }
    },


    layout: {

        theme: {
            light: "فاتح",
            dark: "داكن",
            auto: "تلقائي"
        },

        userMenu: {
            profile: "الملف الشخصي",
            settings: "الإعدادات",
            logout: "تسجيل الخروج"
        },

        sidebar: {
            currentProject: "المشروع الحالي",
            selectProject: "اختر مشروعًا",
            main: "الرئيسية",
            dashboard: "لوحة التحكم",
            projectsSection:"المشاريع",
            projectList:"قائمة المشاريع",
            overview:"نظرة عامة",
            boq: "بنود الكميات",
            progress: "التقدم",
            expenses: "المصروفات",
            costAnalysis: "تحليل التكلفة",
            projectEvents: "الأحداث",
            recommendations: "التوصيات",
            reports: "التقارير",
            administration: "الإدارة",
            users: "المستخدمون",
        },
        
        breadcrumb: {
            dashboard: "لوحة التحكم"
        }
    },

    
    projects: {

        page: {
            title: "المشاريع",
            description: "المشاريع والبيانات المرتبطة بها.",
            addButton: "إضافة مشروع"
        },

        table: {
            id: "المعرف",
            name: "اسم المشروع",
            startDate: "تاريخ البداية",
            endDate: "تاريخ النهاية",
            actions: "الإجراءات",
            edit: "تعديل"
        },

        modal: {
            addTitle: "إضافة مشروع",
            editTitle: "تعديل المشروع",

            projectName: "اسم المشروع",
            description: "الوصف",
            startDate: "تاريخ البداية",
            endDate: "تاريخ النهاية",

            create: "إنشاء",
            saveChanges: "حفظ التعديلات",
            cancel: "إلغاء"
        },

        messages: {
            createdSuccessfully: "تم إنشاء المشروع بنجاح.",
            updatedSuccessfully: "تم تحديث المشروع بنجاح."
        }

    },


    boq: {

        page: {
            title: "BOQ",
            description: "بنود الكميات والبيانات المرتبطة بها.",
            addButton: "إضافة بند",
            lockButton: "اعتماد BOQ"
        },

        summary: {
            project: "المشروع",
            status: "حالة الــ BOQ",
            items: "عدد البنود",
            draft: "مسودة",
            approved: "معتمد"
        },

        table: {
            itemNumber: "رقم البند",
            itemName: "اسم البند",
            unit: "الوحدة",
            quantity: "الكمية",
            unitPrice: "سعر الوحدة (ر.س)",
            totalPrice: "الإجمالي (ر.س)",
            actions: "الإجراءات"
        },

        modal: {

            addTitle: "إضافة بند",
            editTitle: "تعديل البند",
            itemNumber: "رقم البند",
            itemNumberHint: "مثال: 1، 1.1، 1.5.1",
            itemName: "اسم البند",
            unit: "الوحدة",
            quantity: "الكمية",
            unitPrice: "سعر الوحدة (ر.س)",
            notes: "ملاحظات",
            create: "إنشاء",
            saveChanges: "حفظ التعديلات",
            cancel: "إلغاء",
            selectUnit: "اختر الوحدة"
        },

        confirm: {
            deleteTitle: "حذف بند BOQ",
            deleteMessage: "هل أنت متأكد من حذف هذا البند؟ لا يمكن التراجع عن هذه العملية.",
            confirmButton: "حذف",
            cancelButton: "إلغاء",
            lockTitle: "اعتماد الـ BOQ",
            lockMessage: "هل أنت متأكد من اعتماد الـ BOQ؟ بعد الاعتماد لن يكون بالإمكان إضافة أو تعديل أو حذف البنود.",
            lockButton: "اعتماد"
        },

        messages: {
            createdSuccessfully: "تمت إضافة البند بنجاح.",
            updatedSuccessfully: "تم تحديث البند بنجاح.",
            deletedSuccessfully: "تم حذف البند بنجاح.",
            approvedSuccessfully: "تم اعتماد الـ BOQ بنجاح.",
            approved: "اعتماد BOQ",
            addItemBeforeApproval: "أضف بندًا واحدًا على الأقل قبل اعتماد الـ BOQ."
        }

    },

    common: {

        edit: "تعديل",
        delete: "حذف",
        cancel: "إلغاء",
        approve: "اعتماد"

    },

};

export default ar;
