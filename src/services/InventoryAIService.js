


// AI INVENTORY ADMIN / COO SERVICE - UPGRADED VERSION
// ======================================================

const businessKnowledge = `
ESP32 là linh kiện chiến lược cho đồ án IoT.
Arduino UNO là linh kiện phổ biến cho sinh viên năm 2.
RFID RC522 thường dùng chung với ESP32.
Servo SG90 thường tăng nhu cầu vào mùa đồ án.
RFID RC522 thường đi kèm ESP32 trong combo đồ án IoT.
Thiếu linh kiện critical sẽ ảnh hưởng tiến độ đồ án sinh viên.
Ưu tiên tránh hết hàng hơn tối ưu chi phí.
`;

const getFourWeeksAgoTimestamp = () => {
    return Date.now() - 28 * 24 * 60 * 60 * 1000;
};

const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const isStrategicProduct = (name = "") => {
    const lower = name.toLowerCase();

    return (
        lower.includes("esp32") ||
        lower.includes("arduino") ||
        lower.includes("rfid") ||
        lower.includes("rc522") ||
        lower.includes("servo") ||
        lower.includes("sg90")
    );
};

// ======================================================
// ANALYZE INVENTORY
// ======================================================

export const analyzeInventoryData = (products = [], historyOrders = []) => {
    const fourWeeksAgo = getFourWeeksAgoTimestamp();

    const recentOrders = historyOrders.filter(order => {
        const completedAt = safeNumber(order.completedAt, 0);
        return completedAt && completedAt > fourWeeksAgo;
    });

    const salesVolume = {};
    const revenueVolume = {};

    recentOrders.forEach(order => {
        order.items?.forEach(item => {
            const name = item.name;
            const qty = safeNumber(item.qty, 0);
            const price = safeNumber(item.price, 0);

            salesVolume[name] = (salesVolume[name] || 0) + qty;
            revenueVolume[name] = (revenueVolume[name] || 0) + qty * price;
        });
    });

    const insights = products.map(product => {
        const name = product.name || "Không rõ tên";
        const stock = safeNumber(product.stock, 0);
        const price = safeNumber(product.price, 0);

        const soldIn4Weeks = salesVolume[name] || 0;
        const revenueIn4Weeks = revenueVolume[name] || 0;

        const velocityPerWeek = soldIn4Weeks / 4;
        const velocityPerDay = velocityPerWeek / 7;

        const weeksLeft =
            velocityPerWeek > 0
                ? stock / velocityPerWeek
                : 999;

        const estimatedStockoutDays =
            velocityPerDay > 0
                ? Math.floor(stock / velocityPerDay)
                : 999;

        const reorderPoint = Math.ceil(velocityPerWeek * 4);

        const targetStock8Weeks = Math.ceil(velocityPerWeek * 8);

        const suggestedImport =
            targetStock8Weeks > stock
                ? targetStock8Weeks - stock
                : 0;

        let riskLevel = "safe";

        if (estimatedStockoutDays <= 7 || stock <= 5) {
            riskLevel = "critical";
        } else if (estimatedStockoutDays <= 21 || stock <= 15) {
            riskLevel = "warning";
        }

        const criticalLevel = isStrategicProduct(name) ? "high" : "normal";

        let riskScore = 0;

        if (stock <= 5) riskScore += 40;
        else if (stock <= 15) riskScore += 20;

        if (estimatedStockoutDays <= 7) riskScore += 35;
        else if (estimatedStockoutDays <= 21) riskScore += 20;

        if (velocityPerWeek >= 10) riskScore += 25;
        else if (velocityPerWeek >= 5) riskScore += 15;

        if (criticalLevel === "high") riskScore += 20;

        if (revenueIn4Weeks >= 1000000) riskScore += 10;

        let trend = "stable";

        if (velocityPerWeek >= 15) {
            trend = "high-demand";
        } else if (velocityPerWeek >= 5) {
            trend = "growing";
        } else if (soldIn4Weeks === 0 && stock > 30) {
            trend = "slow-moving";
        }

        const isRisk = riskLevel === "critical" || riskLevel === "warning";

        let adminInsight = "Tồn kho đang ổn định.";

        if (riskLevel === "critical") {
            adminInsight = `${name} đang ở mức nguy hiểm, cần nhập gấp để tránh hết hàng.`;
        } else if (riskLevel === "warning") {
            adminInsight = `${name} cần theo dõi vì tồn kho có dấu hiệu giảm.`;
        } else if (trend === "slow-moving") {
            adminInsight = `${name} bán chậm, nên hạn chế nhập thêm hoặc tạo combo xả tồn.`;
        }

        return {
            name,
            category: product.category || "Unknown",
            location: product.location || "Chưa rõ",
            price,
            currentStock: stock,
            soldIn4Weeks,
            revenueIn4Weeks,
            velocityPerWeek: Number(velocityPerWeek.toFixed(2)),
            weeksLeft: Number(weeksLeft.toFixed(1)),
            estimatedStockoutDays,
            reorderPoint,
            suggestedImport,
            riskLevel,
            criticalLevel,
            riskScore,
            trend,
            isRisk,
            adminInsight
        };
    });

    return insights.sort((a, b) => b.riskScore - a.riskScore);
};

// ======================================================
// ADMIN SUMMARY
// ======================================================

export const buildInventoryAdminSummary = (insights = []) => {
    const riskItems = insights.filter(i => i.isRisk);
    const criticalItems = insights.filter(i => i.riskLevel === "critical");
    const warningItems = insights.filter(i => i.riskLevel === "warning");
    const slowMovingItems = insights.filter(i => i.trend === "slow-moving");
    const highDemandItems = insights.filter(i => i.trend === "high-demand");

    const totalStockValue = insights.reduce(
        (sum, item) => sum + safeNumber(item.currentStock) * safeNumber(item.price),
        0
    );

    const totalRevenue4Weeks = insights.reduce(
        (sum, item) => sum + safeNumber(item.revenueIn4Weeks),
        0
    );

    const topRiskItems = [...insights]
        .filter(i => i.riskScore > 0)
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

    const topSuggestedImports = [...insights]
        .filter(i => i.suggestedImport > 0)
        .sort((a, b) => b.suggestedImport - a.suggestedImport)
        .slice(0, 5);

    let recommendation = "Kho đang ổn định, tiếp tục theo dõi định kỳ.";

    if (criticalItems.length > 0) {
        recommendation = `Cần xử lý gấp ${criticalItems.length} linh kiện critical để tránh hết hàng.`;
    } else if (warningItems.length > 0) {
        recommendation = `Có ${warningItems.length} linh kiện cần theo dõi và chuẩn bị nhập bổ sung.`;
    } else if (slowMovingItems.length > 0) {
        recommendation = `Không có rủi ro thiếu hàng, nhưng có ${slowMovingItems.length} mặt hàng bán chậm cần tối ưu tồn kho.`;
    }

    return {
        totalItems: insights.length,
        riskItems: riskItems.length,
        criticalItems: criticalItems.length,
        warningItems: warningItems.length,
        slowMovingItems: slowMovingItems.length,
        highDemandItems: highDemandItems.length,
        totalStockValue,
        totalRevenue4Weeks,
        topRiskItems,
        topSuggestedImports,
        recommendation
    };
};

// ======================================================
// QUICK ADMIN MESSAGE
// ======================================================

export const getQuickAdminInventoryMessage = (insights = []) => {
    if (!insights || insights.length === 0) {
        return "📦 Kho hiện chưa có dữ liệu để AI phân tích.";
    }

    const summary = buildInventoryAdminSummary(insights);
    const topRisk = summary.topRiskItems[0];

    if (summary.criticalItems > 0 && topRisk) {
        return `🚨 Có ${summary.criticalItems} linh kiện CRITICAL. Ưu tiên xử lý ${topRisk.name}, dự kiến còn khoảng ${topRisk.estimatedStockoutDays} ngày hàng.`;
    }

    if (summary.warningItems > 0 && topRisk) {
        return `⚠️ Có ${summary.warningItems} linh kiện cần theo dõi. ${topRisk.name} đang có rủi ro cao nhất.`;
    }

    if (summary.slowMovingItems > 0) {
        return `✅ Không có nguy cơ thiếu hàng. Tuy nhiên có ${summary.slowMovingItems} mặt hàng bán chậm, nên cân nhắc combo hoặc khuyến mãi.`;
    }

    return "✅ Kho đang vận hành ổn định. Chưa phát hiện rủi ro lớn.";
};

// ======================================================
// LOCAL FALLBACK STRATEGY - WORKS EVEN WHEN AI API FAILS
// ======================================================

export const buildLocalInventoryStrategy = (inventoryInsights = []) => {
    const summary = buildInventoryAdminSummary(inventoryInsights);

    const items = summary.topRiskItems.map((item, index) => ({
        name: item.name,
        riskLevel: item.riskLevel,
        reason:
            item.riskLevel === "critical"
                ? `${item.name} có nguy cơ hết hàng trong khoảng ${item.estimatedStockoutDays} ngày.`
                : `${item.name} cần theo dõi vì tồn kho hoặc tốc độ bán đang tiệm cận ngưỡng rủi ro.`,
        suggestedImport: item.suggestedImport,
        priority: index + 1,
        stockoutDays: item.estimatedStockoutDays,
        currentStock: item.currentStock,
        velocityPerWeek: item.velocityPerWeek
    }));

    const actions = [];

    if (summary.criticalItems > 0) {
        actions.push("Duyệt nhập gấp các linh kiện critical trong hôm nay.");
    }

    if (summary.warningItems > 0) {
        actions.push("Theo dõi nhóm warning và kiểm tra lại tồn kho sau mỗi 24 giờ.");
    }

    if (summary.topSuggestedImports.length > 0) {
        actions.push(
            `Ưu tiên nhập ${summary.topSuggestedImports[0].name} với số lượng đề xuất khoảng ${summary.topSuggestedImports[0].suggestedImport}.`
        );
    }

    if (summary.slowMovingItems > 0) {
        actions.push("Tạo combo hoặc khuyến mãi cho các mặt hàng bán chậm để giảm tồn kho.");
    }

    if (actions.length === 0) {
        actions.push("Tiếp tục theo dõi vận hành kho, chưa cần nhập bổ sung khẩn cấp.");
    }

    return {
        summary: {
            totalRiskItems: summary.riskItems,
            criticalItems: summary.criticalItems,
            warningItems: summary.warningItems,
            recommendation: summary.recommendation,
            totalStockValue: summary.totalStockValue,
            totalRevenue4Weeks: summary.totalRevenue4Weeks
        },
        items,
        actions,
        source: "local-engine"
    };
};

// ======================================================
// FORMAT FOR UI TEXT
// ======================================================

export const formatInventoryStrategyText = (strategy) => {
    if (!strategy) {
        return "AI chưa có dữ liệu phân tích.";
    }

    if (strategy.error) {
        return `⚠️ ${strategy.message || "AI gặp lỗi khi phân tích."}`;
    }

    const summary = strategy.summary || {};
    const items = strategy.items || [];
    const actions = strategy.actions || [];

    return `
📦 TỔNG QUAN TỒN KHO

• Risk Items: ${summary.totalRiskItems ?? 0}
• Critical: ${summary.criticalItems ?? 0}
• Warning: ${summary.warningItems ?? 0}

🧠 Nhận định:
${summary.recommendation || "Chưa có khuyến nghị."}

━━━━━━━━━━━━━━━━━━━━

🔥 LINH KIỆN ƯU TIÊN

${
    items.length > 0
        ? items.map(item => `
${item.priority}. ${item.name}
• Mức rủi ro: ${item.riskLevel}
• Lý do: ${item.reason}
• Tồn hiện tại: ${item.currentStock ?? "N/A"}
• Bán/tuần: ${item.velocityPerWeek ?? "N/A"}
• Đề xuất nhập: ${item.suggestedImport}
`).join("\n")
        : "Không có linh kiện rủi ro cao."
}

━━━━━━━━━━━━━━━━━━━━

📌 HÀNH ĐỘNG ĐỀ XUẤT

${
    actions.length > 0
        ? actions.map(action => `• ${action}`).join("\n")
        : "• Tiếp tục theo dõi kho."
}
`.trim();
};

// ======================================================
// AI COO AGENT
// ======================================================

export const getAIInventoryStrategy = async (inventoryInsights = []) => {
    const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
    const API_URL = "https://openrouter.ai/api/v1/chat/completions";

    const filteredData = [...inventoryInsights]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 8);

    if (filteredData.length === 0) {
        return buildLocalInventoryStrategy([]);
    }

    if (!API_KEY) {
        return buildLocalInventoryStrategy(inventoryInsights);
    }

    const localStrategy = buildLocalInventoryStrategy(inventoryInsights);

    const systemPrompt = `
Bạn là AI COO Assistant cho hệ thống bán linh kiện IoT.

Vai trò:
- Hỗ trợ ADMIN ra quyết định nhập hàng.
- Ưu tiên tránh hết hàng critical.
- Phân tích theo tồn kho, tốc độ bán, stockout days, risk score.
- Không bịa số liệu.
- Chỉ trả về JSON hợp lệ, không markdown.

Business knowledge:
${businessKnowledge}
`;

    const userPrompt = `
LOCAL STRATEGY:
${JSON.stringify(localStrategy)}

REAL INVENTORY DATA:
${JSON.stringify(filteredData)}

Hãy nâng cấp phân tích thành JSON:

{
  "summary": {
    "totalRiskItems": number,
    "criticalItems": number,
    "warningItems": number,
    "recommendation": string
  },
  "items": [
    {
      "name": string,
      "riskLevel": "critical" | "warning" | "safe",
      "reason": string,
      "suggestedImport": number,
      "priority": number,
      "currentStock": number,
      "velocityPerWeek": number
    }
  ],
  "actions": [
    string
  ],
  "source": "ai-coo"
}
`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            return {
                ...localStrategy,
                source: "local-fallback",
                warning: data.error?.message || "AI API lỗi, đã dùng phân tích nội bộ."
            };
        }

        const content = data.choices?.[0]?.message?.content || "";

        const cleaned = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("AI INVENTORY ERROR:", error);

        return {
            ...localStrategy,
            source: "local-fallback",
            warning: "Không kết nối được AI API, đã dùng phân tích nội bộ."
        };
    }
};


