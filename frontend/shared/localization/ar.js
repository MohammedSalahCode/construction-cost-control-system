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
            dashboard: "لوحة المعلومات",
            projectsSection:"المشاريع",
            projectList:"قائمة المشاريع",
            overview:"نظرة عامة",
            boq: "جدول الكميات",
            progress: "متابعة التنفيذ",
            expenses: "إدارة المصروفات",
            costAnalysis: "تحليل التكلفة",
            projectEvents: "سجل الأحداث",
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
            items: "عدد بنود",
            draft: "مسودة",
            approved: "معتمد"
        },

        table: {
            itemNumber: "رقم البند",
            itemName: "وصف البند",
            unit: "الوحدة",
            contractquantity: "الكمية التعاقدية",
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


    progress: {

        page: {
            title: "متابعة التنفيذ",
            description: "متابعة تقدم تنفيذ أعمال المشروع واعتماد سجلات التنفيذ."
        },

        table: {
            itemNumber: "رقم البند",
            itemName: "وصف  البند",
            unit: "الوحدة",
            contractQuantity: "الكمية التعاقدية",
            executedQuantity: "الكمية المنفذة",
            remainingQuantity: "الكمية المتبقية",
            progressPercentage: "نسبة الإنجاز",
            actions: "الإجراءات",
            recordProgress: "تسجيل التنفيذ"
        },

        entries: {
            title: "سجلات التنفيذ",
            item: "البند",
            quantityDone: "الكمية المنفذة",
            date: "تاريخ التنفيذ",
            status: "حالة الاعتماد",
            submittedBy: "مقدم الطلب",
            actions: "الإجراءات"
        },

        modal: {
            addTitle: "تسجيل التنفيذ",
            editTitle: "تعديل التنفيذ",
            boqItem: "البند",
            quantityDone: "الكمية المنفذة",
            executionDate: "تاريخ التنفيذ",
            siteNotes: "ملاحظات مهندس الموقع",
            create: "تسجيل",
            update: "تحديث",
            cancel: "إلغاء"
        },

        details: {
            title: "تفاصيل التنفيذ",
            reviewerComment: "تعليق مدير المشروع",
        },

        messages: {
            createdSuccessfully: "تم تسجيل التنفيذ بنجاح.",
            updatedSuccessfully: "تم تحديث سجل التنفيذ بنجاح.",
            approvedSuccessfully: "تم اعتماد سجل التنفيذ بنجاح.",
            reviewerCommentRequired: "يرجى إدخال  سبب الرفض.",
            rejectedSuccessfully: "تم رفض سجل التنفيذ بنجاح."
        },

        confirm: {
            approveTitle: "اعتماد سجل التنفيذ",
            approveMessage: "هل أنت متأكد من اعتماد سجل التنفيذ؟ بعد الاعتماد سيتم تحديث كميات التنفيذ المعتمدة.",
            approveButton: "اعتماد",
            rejectTitle: "رفض سجل التنفيذ",
            rejectMessage: "هل أنت متأكد من رفض سجل التنفيذ؟ سيتم إرجاع السجل للتعديل."
        }
    },


    common: {

        edit: "تعديل",
        delete: "حذف",
        cancel: "إلغاء",
        approve: "اعتماد",
        pending: "قيد المراجعة",
        approved: "معتمد",
        rejected: "مرفوض",
        reject: "رفض",
        view: "عرض",
    },

};

export default ar;
