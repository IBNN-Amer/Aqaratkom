/**
 * WhatsApp Real Estate Chatbot Handler
 * Implements conversational flow for property requests and offers
 */

interface UserState {
  userId: string;
  step: number;
  data: {
    type?: string;
    unitType?: string;
    budget?: string;
    area?: string;
    details?: string;
    offerData?: string;
  };
  createdAt: Date;
}

interface PropertyOffer {
  userId: string;
  offerData: string;
  createdAt: Date;
}

const userStates: Map<string, UserState> = new Map();
const propertyOffers: PropertyOffer[] = [];

const UNIT_TYPES: Record<string, string> = {
  "1": "شقة",
  "2": "فيلا",
  "3": "مكتب",
  "4": "أرض",
};

/**
 * Main message handler - processes incoming WhatsApp messages
 * and returns appropriate response based on conversation state
 */
export function handleBotMessage(userId: string, message: string): string {
  const normalizedMessage = message.trim().toLowerCase();
  
  let userState = userStates.get(userId);
  
  if (!userState) {
    userState = {
      userId,
      step: 1,
      data: {},
      createdAt: new Date(),
    };
    userStates.set(userId, userState);
    
    return (
      "مرحبًا بك في عقارك 1! 🏠\n\n" +
      "اختر نوع الطلب:\n" +
      "1. طلب شراء\n" +
      "2. طلب إيجار\n" +
      "3. عرض عقار للبيع\n" +
      "4. عرض عقار للإيجار\n\n" +
      "أرسل رقم الخيار المطلوب"
    );
  }
  
  const { step, data } = userState;
  
  if (normalizedMessage === "إلغاء" || normalizedMessage === "cancel" || normalizedMessage === "0") {
    userStates.delete(userId);
    return "تم إلغاء الطلب. أرسل أي رسالة للبدء من جديد.";
  }
  
  switch (step) {
    case 1:
      return handleStep1(userState, normalizedMessage);
    case 2:
      return handleStep2(userState, normalizedMessage);
    case 3:
      return handleStep3(userState, normalizedMessage);
    case 4:
      return handleStep4(userState, normalizedMessage);
    case 5:
      return handleStep5(userState, normalizedMessage);
    case 10:
      return handleStep10(userState, message);
    default:
      userStates.delete(userId);
      return "حدث خطأ، أرسل أي رسالة للبدء من جديد.";
  }
}

function handleStep1(userState: UserState, message: string): string {
  if (message === "1" || message === "2") {
    userState.data.type = message === "1" ? "طلب شراء" : "طلب إيجار";
    userState.step = 2;
    return (
      `✅ تم اختيار: ${userState.data.type}\n\n` +
      "اختر نوع الوحدة:\n" +
      "1. شقة 🏢\n" +
      "2. فيلا 🏡\n" +
      "3. مكتب 🏬\n" +
      "4. أرض 🏗️\n\n" +
      "أرسل 0 للإلغاء"
    );
  } else if (message === "3" || message === "4") {
    userState.data.type = message === "3" ? "عرض بيع" : "عرض إيجار";
    userState.step = 10;
    return (
      `✅ تم اختيار: ${userState.data.type}\n\n` +
      "📝 أرسل بيانات العقار بالشكل التالي:\n\n" +
      "• نوع العقار (شقة/فيلا/مكتب/أرض)\n" +
      "• السعر\n" +
      "• المساحة\n" +
      "• الموقع/المدينة\n" +
      "• عدد الغرف والحمامات\n" +
      "• أي تفاصيل إضافية\n\n" +
      "أرسل 0 للإلغاء"
    );
  } else {
    return "❌ اختر رقم صحيح من 1 إلى 4.";
  }
}

function handleStep2(userState: UserState, message: string): string {
  if (UNIT_TYPES[message]) {
    userState.data.unitType = UNIT_TYPES[message];
    userState.step = 3;
    return (
      `✅ نوع الوحدة: ${userState.data.unitType}\n\n` +
      "💰 ما هي ميزانيتك المتوقعة؟\n" +
      "(مثال: 500,000 ريال أو 1,000,000 ريال)\n\n" +
      "أرسل 0 للإلغاء"
    );
  } else {
    return "❌ اختر رقم صحيح لنوع الوحدة (1-4).";
  }
}

function handleStep3(userState: UserState, message: string): string {
  userState.data.budget = message;
  userState.step = 4;
  return (
    `✅ الميزانية: ${message}\n\n` +
    "📐 ما هي المساحة المطلوبة؟\n" +
    "(مثال: 150 متر² أو 200-300 متر²)\n\n" +
    "أرسل 0 للإلغاء"
  );
}

function handleStep4(userState: UserState, message: string): string {
  userState.data.area = message;
  userState.step = 5;
  return (
    `✅ المساحة: ${message}\n\n` +
    "📝 هل هناك تفاصيل إضافية؟\n" +
    "• عدد غرف النوم\n" +
    "• عدد الحمامات\n" +
    "• الطابق المفضل\n" +
    "• المنطقة/الحي المفضل\n" +
    "• أي ملاحظات أخرى\n\n" +
    "(أرسل 'لا' إذا لم تكن هناك تفاصيل إضافية)\n" +
    "أرسل 0 للإلغاء"
  );
}

function handleStep5(userState: UserState, message: string): string {
  userState.data.details = message === "لا" ? "لا توجد تفاصيل إضافية" : message;
  
  const summary = formatRequestSummary(userState.data);
  
  userStates.delete(userState.userId);
  
  return (
    "✅ تم تسجيل طلبك بنجاح!\n\n" +
    "📋 ملخص الطلب:\n" +
    "─────────────────\n" +
    summary +
    "\n─────────────────\n\n" +
    "سيتواصل معك أحد مستشارينا العقاريين قريبًا.\n" +
    "شكرًا لاستخدامك عقارك 1! 🏠"
  );
}

function handleStep10(userState: UserState, message: string): string {
  propertyOffers.push({
    userId: userState.userId,
    offerData: message,
    createdAt: new Date(),
  });
  
  userStates.delete(userState.userId);
  
  return (
    "✅ تم استلام بيانات العقار بنجاح!\n\n" +
    "📋 نوع العرض: " + userState.data.type + "\n" +
    "📝 التفاصيل: " + message.substring(0, 100) + (message.length > 100 ? "..." : "") + "\n\n" +
    "سيتم مراجعة العقار ونشره للعملاء المهتمين.\n" +
    "سيتواصل معك فريقنا للتأكيد.\n\n" +
    "شكرًا لاستخدامك عقارك 1! 🏠"
  );
}

function formatRequestSummary(data: UserState["data"]): string {
  const lines = [];
  if (data.type) lines.push(`📌 نوع الطلب: ${data.type}`);
  if (data.unitType) lines.push(`🏠 نوع الوحدة: ${data.unitType}`);
  if (data.budget) lines.push(`💰 الميزانية: ${data.budget}`);
  if (data.area) lines.push(`📐 المساحة: ${data.area}`);
  if (data.details) lines.push(`📝 التفاصيل: ${data.details}`);
  return lines.join("\n");
}

/**
 * Get all pending property offers
 */
export function getPropertyOffers(): PropertyOffer[] {
  return [...propertyOffers];
}

/**
 * Get user's current conversation state
 */
export function getUserState(userId: string): UserState | undefined {
  return userStates.get(userId);
}

/**
 * Clear user's conversation state
 */
export function clearUserState(userId: string): void {
  userStates.delete(userId);
}

/**
 * Get conversation data for creating a property request in the database
 */
export function getCompletedRequestData(data: UserState["data"]): {
  type: string;
  unitType: string;
  budget: string;
  area: string;
  details: string;
} | null {
  if (!data.type || !data.unitType || !data.budget || !data.area) {
    return null;
  }
  return {
    type: data.type,
    unitType: data.unitType,
    budget: data.budget,
    area: data.area,
    details: data.details || "",
  };
}
