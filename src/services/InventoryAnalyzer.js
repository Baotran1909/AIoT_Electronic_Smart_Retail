export const analyzeInventory = (
  products,
  historyOrders = []
) => {

  return products.map(p => {

    // =========================
    // LẤY ĐƠN LIÊN QUAN
    // =========================

    const relatedOrders = historyOrders.filter(order =>
      order.items?.some(i => i.id === p.id)
    );

    // =========================
    // TỔNG SỐ BÁN
    // =========================

    const soldQty = relatedOrders.reduce((sum, order) => {

      const item = order.items.find(i => i.id === p.id);

      return sum + Number(item?.qty || 0);

    }, 0);

    // =========================
    // DOANH THU
    // =========================

    const revenue = relatedOrders.reduce((sum, order) => {

      const item = order.items.find(i => i.id === p.id);

      return (
        sum +
        Number(item?.qty || 0) *
        Number(item?.price || 0)
      );

    }, 0);

    // =========================
    // TỐC ĐỘ BÁN
    // =========================

    const velocityPerWeek = soldQty / 4;

    // =========================
    // AI RISK SCORE
    // =========================

    let riskScore = 0;

    // tồn kho thấp
    if (p.stock <= 5)
      riskScore += 40;

    else if (p.stock <= 15)
      riskScore += 20;

    // bán nhanh
    if (velocityPerWeek >= 10)
      riskScore += 30;

    else if (velocityPerWeek >= 5)
      riskScore += 15;

    // doanh thu cao
    if (revenue >= 3000000)
      riskScore += 20;

    // linh kiện chiến lược
    if (
      p.category === "Vi điều khiển"
    ) {
      riskScore += 10;
    }

    // =========================
    // PHÂN LOẠI
    // =========================

    let risk = "LOW";

    if (riskScore >= 70) {
      risk = "CRITICAL";
    }

    else if (riskScore >= 40) {
      risk = "MEDIUM";
    }

    // =========================
    // DỰ ĐOÁN HẾT HÀNG
    // =========================

    const estimatedWeeks =
      velocityPerWeek > 0
        ? Math.round(
            p.stock / velocityPerWeek
          )
        : null;

    // =========================
    // AI MESSAGE
    // =========================

    let aiMessage =
      "Tồn kho ổn định.";

    if (!velocityPerWeek) {

      aiMessage =
        "Chưa có dữ liệu bán hàng.";

    }

    else if (risk === "CRITICAL") {

      aiMessage =
        "Nguy cơ thiếu hàng cao. Nên nhập thêm sớm.";

    }

    else if (
      p.stock > 100 &&
      velocityPerWeek < 1
    ) {

      aiMessage =
        "Tồn kho cao nhưng sức mua thấp.";

    }

    // =========================

    return {

      name: p.name,

      stock: p.stock,

      soldQty,

      revenue,

      velocityPerWeek,

      estimatedWeeks,

      risk,

      riskScore,

      aiMessage,

      suggestedImport:

        risk === "CRITICAL"
          ? 100
          : risk === "MEDIUM"
          ? 40
          : 0
    };
  });
};