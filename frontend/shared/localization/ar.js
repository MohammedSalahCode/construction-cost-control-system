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


    dashboard: {

        page: {
            title: "داشبورد",
            description: "أهم مستجدات المشروع والتنبيهات التي تتطلب الانتباه"
        },

        welcome: {
            title: "مساحة عمل المشروع",
            message: "اختر مشروعًا للدخول إلى مساحة العمل الخاصة به ومتابعة المهام المخصصة لك.",
            loadingProjects: "جاري تحميل المشاريع..."
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
            dashboard: "داشبورد",
            projectsSection: "المشاريع",
            projectList: "قائمة المشاريع",
            overview: "نظرة عامة",
            boq: "جدول الكميات",
            progress: "متابعة التنفيذ",
            expenses: "إدارة المصروفات",
            costAnalysis: "تحليل التكلفة",
            projectLog: "سجل المشروع",
            administration: "الإدارة",
            users: "المستخدمون"
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
            status:"حالة المشروع",
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
        },

        status: {
            boqPreparation: "إعداد جدول الكميات",
            inExecution: "قيد التنفيذ",
            completed: "مكتمل",
            closedOut: "مغلق نهائياً"
        },

        card: {
            startDate: "تاريخ البدء",
            boqItems: "عدد بنود الكميات",
            select: "دخول المشروع"
        }
    },


    boq: {

        page: {
            title: "جدول الكميات",
            description: "إدارة بنود جدول الكميات وقيمها التعاقدية",
            addButton: "إضافة بند",
            lockButton: "اعتماد جدول الكميات"
        },

        summary: {
            project: "المشروع",
            status: "حالة جدول الكميات",
            items: "عدد البنود",
            totalValue: "إجمالي القيمة",
            draft: "مسودة",
            approved: "معتمد"

        },

        table: {
            title: "بنود جدول الكميات",
            description: "البنود والقيم التعاقدية المسجلة للمشروع.",
            itemNumber: "رقم البند",
            itemName: "وصف البند",
            unit: "الوحدة",
            contractquantity: "الكمية التعاقدية",
            unitPrice: "سعر الوحدة",
            totalPrice: "إجمالي القيمة",
            actions: "الإجراءات"
        },

        modal: {
            addTitle: "إضافة بند إلى جدول الكميات",
            editTitle: "تعديل بند جدول الكميات",
            itemNumber: "رقم البند",
            itemNumberHint: "مثال: 1، 1.1، 1.5.1",
            itemName: "وصف البند",
            unit: "الوحدة",
            quantity: "الكمية",
            unitPrice: "سعر الوحدة (ر.س)",
            notes: "ملاحظات",
            create: "إضافة البند",
            saveChanges: "حفظ التعديلات",
            cancel: "إلغاء",
            selectUnit: "اختر الوحدة"
        },

        confirm: {
            deleteTitle: "حذف بند",
            deleteMessage: "هل أنت متأكد من حذف هذا البند؟ لا يمكن التراجع عن هذه العملية.",
            confirmButton: "حذف",
            cancelButton: "إلغاء",
            lockTitle: "اعتماد جدول الكميات",
            lockMessage:
                "هل أنت متأكد من اعتماد جدول الكميات؟\n" +
                "سيتم نقل المشروع إلى حالة \"قيد التنفيذ\" وتثبيت بنود جدول الكميات.\n" +
                "بعد الاعتماد:\n" +
                "- لن يكون بالإمكان إضافة أو تعديل أو حذف بنود جدول الكميات.\n" +
                "- يمكن البدء بتسجيل تقدم التنفيذ والمصروفات.",
            lockButton: "اعتماد"
        },

        messages: {
            createdSuccessfully: "تمت إضافة البند بنجاح",
            updatedSuccessfully: "تم حفظ تعديلات البند بنجاح",
            deletedSuccessfully: "تم حذف البند بنجاح",
            approvedSuccessfully: "تم اعتماد جدول الكميات بنجاح",
            approved: "معتمد",
            addItemBeforeApproval: "أضف بندًا واحدًا على الأقل قبل اعتماد جدول الكميات",
            noItems: "لا توجد بنود في جدول الكميات",
            noItemsDescription: "أضف أول بند لبدء إعداد جدول كميات المشروع."
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
            submittedBy: "مقدم السجل ",
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
            reviewerComment: "تعليق مدير المشروع"
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
            approveMessage: "هل أنت متأكد من اعتماد سجل التنفيذ؟ بعد الاعتماد ستُضاف الكمية المنفذة إلى إجمالي الكميات المنفذة المعتمدة.",
            approveButton: "اعتماد",
            rejectTitle: "رفض سجل التنفيذ",
            rejectMessage: "هل أنت متأكد من رفض سجل التنفيذ؟ سيتم إرجاع السجل للتعديل."
        }
    },


    expenses: {

        page: {
            title: "مصروفات المشروع",
            description: "تسجيل ومراجعة واعتماد مصروفات المشروع."
        },

        table: {
            itemNumber: "رقم البند",
            itemName: "وصف  البند",
            unit: "الوحدة",
            unitPrice: "سعر الوحدة (ر.س)",
            contractQuantity: "الكمية التعاقدية",
            contractValue: "قيمة البند (ر.س)",
            totalApprovedExpenses: "المصروفات / قيمة البند",
            actions: "الإجراءات",
            recordExpense: "تسجيل مصروف مباشر",
            recordGeneralExpense: "تسجيل مصروف عام"
        },

        entries: {
            title: "سجل المصروفات",
            expenseType: "نوع المصروف",
            item: "البند",
            amount: "المبلغ",
            expenseDate: "تاريخ المصروف",
            status: "حالة الاعتماد",
            submittedBy: "مقدم السجل",
            actions: "الإجراءات"
        },

        modal: {
            directTitle: "تسجيل مصروف مباشر",
            generalTitle: "تسجيل مصروف عام",
            editTitle: "تعديل المصروف",
            editDirectTitle: "تعديل المصروف المباشر",
            editGeneralTitle: "تعديل المصروف العام",
            expenseType: "نوع المصروف",
            selectType: "اختر نوع المصروف",
            direct: "مصروف مباشر",
            indirect: "مصروف غير مباشر",
            overhead: "مصروفات عامة وإدارية",
            boqItem: "البند",
            amount: "المبلغ",
            expenseDate: "تاريخ المصروف",
            referenceNumber: "رقم المستند المرجعي",
            description: "الوصف",
            create: "تسجيل",
            update: "تحديث",
            cancel: "إلغاء"
        },

        details: {
            title: "تفاصيل المصروف",
            reviewerComment: "تعليق المدير المالي",
            ofItemValue: "من قيمة البند"
        },

        messages: {
            createdSuccessfully: "تم تسجيل المصروف بنجاح.",
            updatedSuccessfully: "تم تحديث سجل المصروف بنجاح.",
            approvedSuccessfully: "تم اعتماد سجل المصروف بنجاح.",
            reviewerCommentRequired: "يرجى إدخال سبب الرفض.",
            rejectedSuccessfully: "تم رفض سجل المصروف بنجاح."
        },

        confirm: {
            approveTitle: "اعتماد سجل المصروف",
            approveMessage: "هل أنت متأكد من اعتماد سجل المصروف؟ بعد الاعتماد سيتم احتساب المصروف ضمن التكلفة الفعلية.",
            approveButton: "اعتماد",
            rejectTitle: "رفض سجل المصروف",
            rejectMessage: "هل أنت متأكد من رفض سجل المصروف؟ سيتم إرجاع السجل للتعديل."
        }
    },


    currency: {
        symbol: "(ر.س)"
    },


    costAnalysis: {
        page: {
            title: "تحليل التكاليف",
            description: "تحليل أداء التكاليف والربحية ومتابعة مؤشرات المشروع"
        },

        workspace: {
            title: "لوحة مراقبة التكاليف",
            description: "متابعة التنفيذ وأداء التكاليف والربحية",
            liveAnalysis: "تحليل مباشر"
        },

        tabs: {
            overview: "الملخص",
            itemAnalysis: "تحليل البنود",
            trendForecast: "الاتجاهات والتوقعات",
            reports: "التقارير"
        },

        overview: {

            financial: {
                title: "الملخص المالي",
                description: "الإيرادات والتكاليف والربحية للفترة المحددة",
                contractValue: "قيمة العقد",
                earnedRevenue: "الإيراد المكتسب",
                actualCost: "التكلفة الفعلية",
                grossProfit: "إجمالي الربح",
                grossMargin: "هامش إجمالي الربح",
                netProfit: "صافي الربح",
                netMargin: "هامش صافي الربح"
            },

            execution: {
                title: "حالة التنفيذ",
                description: "حالة تنفيذ بنود المشروع بناءً على نسب الإنجاز المعتمدة",
                overallProgress: "نسبة الإنجاز الإجمالية",
                completed: "مكتمل",
                inProgress: "قيد التنفيذ",
                notStarted: "لم يبدأ"
            },

            performance: {
                title: "أداء التكاليف",
                description: "مقارنة التكاليف المخططة والفعلية للفترة المحددة",
                budget: "الميزانية",
                plannedCost: "التكلفة المقدرة للأعمال المنفذة",
                actualCost: "التكلفة الفعلية",
                costVariance: "انحراف التكلفة",
                varianceDescription: "التكلفة المقدرة للأعمال المنفذة − التكلفة الفعلية",
                cpi: "مؤشر أداء التكلفة (CPI)"
            },

            structure: {
                title: "هيكل التكاليف",
                description: "توزيع التكلفة الفعلية للمشروع حسب نوع التكلفة",
                direct: "التكاليف المباشرة",
                indirect: "التكاليف غير المباشرة",
                overhead: "مصروفات عامة وإدارية"
            },

            alerts: {
                title: "تنبيهات مراقبة التكاليف",
                description: "بنود تتطلب الانتباه بناءً على مؤشرات مراقبة التكاليف الحالية",
                costOverruns: "يوجد {count} بند تجاوزت فيه التكلفة الفعلية التكلفة المخططة",
                progressWithoutCost: "يوجد {count} بند به تقدّم دون تسجيل تكلفة فعلية",
                missingEstimatedCost: "يوجد {count} بند بدون تكلفة وحدة مخططة",
                lossRisk: "يوجد {count} بند معرض لخطر الخسارة",
                noAlerts: "لا توجد تنبيهات لمراقبة التكاليف حاليًا"
            }

        },

        period: {
            title: "فترة التحليل",
            description: "اختر الفترة التي تريد مراجعة أداء التكاليف خلالها",
            cumulative: "تراكمي",
            currentWeek: "الأسبوع الجاري",
            currentMonth: "الشهر الجاري",
            custom: "تاريخ مخصص",
            from: "من",
            to: "الي",
            apply: "تطبيق الفترة",
            analysisPeriod: "فترة التحليل"
        },

        table: {
            itemNumber: "رقم البند",
            itemName: "البند",
            contractQuantity: "الكمية التعاقدية",
            periodExecutedQuantity: "كمية الفترة",
            periodProgress: "إنجاز الفترة %",
            cumulativeExecutedQuantity: "الكمية التراكمية",
            cumulativeProgress: "الإنجاز التراكمي %",
            contractValue: "قيمة العقد",
            earnedRevenue: "الإيراد المكتسب",
            budgetUnitCost: "تكلفة الوحدة المخططة",
            periodPlannedCost: "التكلفة المخططة",
            actualCost: "التكلفة الفعلية",
            profit: "الربح",
            margin: "هامش الربح %"
        },

        filters: {
            title: "تصفية البنود",
            description: "اختر البنود التي تريد عرضها",
            allItems: "جميع البنود",
            costOverrun: "تجاوز التكلفة المخططة",
            costExceedsRevenue: "التكلفة الفعلية تتجاوز الإيراد",
            progressWithoutCost: "تقدّم بدون تكلفة",
            noProgressInPeriod: "لا تقدّم خلال الفترة",
            inProgress: "قيد التنفيذ",
            completed: "مكتمل"
        },

        tooltips: {
            costOverrun: "التكلفة الفعلية أعلى من التكلفة المخططة للكمية المنفذة خلال الفترة",
            costExceedsRevenue: "التكلفة الفعلية أعلى من الإيراد المكتسب للكمية المنفذة خلال الفترة",
            progressWithoutCost: "تم تسجيل تقدّم خلال الفترة دون تسجيل تكلفة فعلية",
            noProgressInPeriod: "لم يتم تسجيل تقدّم خلال الفترة، والبند غير مكتمل"
        },

        confirm: {
            addBudgetTitle: "إضافة تكلفة الوحدة المخططة",
            addBudgetMessage: "سيتم حفظ تكلفة الوحدة المخططة لهذا البند. بعد الحفظ لن يكون بالإمكان تعديلها من هذه الشاشة. هل تريد المتابعة؟"
        },

        messages: {
            noItems: "لا توجد بنود BOQ لعرضها",
            invalidBudgetUnitCost: "يرجى إدخال قيمة صحيحة لتكلفة الوحدة المخططة",
            budgetAdded: "تمت إضافة تكلفة الوحدة المخططة بنجاح",
            selectDateRange: "يجب تحديد تاريخ البداية والنهاية للفترة المخصصة",
            invalidCustomPeriod: {
                startEndOnlyCustom: "لا يمكن تحديد تاريخ البداية والنهاية إلا للفترة المخصصة",
                startEndRequired: "يجب تحديد تاريخ البداية والنهاية للفترة المخصصة",
                startBeforeProject: "لا يمكن أن يسبق تاريخ البداية تاريخ بدء المشروع",
                startAfterEnd: "لا يمكن أن يتجاوز تاريخ البداية تاريخ النهاية",
                endInFuture: "لا يمكن أن يتجاوز تاريخ النهاية تاريخ اليوم"
            }
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
        update: "تحديث",
        confirm: "تأكيد",
        optional:"اختياري",
        currency: "ر.س",
        errors: {
            unexpected: "حدث خطأ غير متوقع",
            forbidden: "ليس لديك صلاحية لتنفيذ هذا الإجراء"
        }
    },

};

export default ar;
