export const sendSMS = async (
  customerPhone,
  orderId,
  userName
) => {

  
    const message =
    "Cam on quy khach da su dung dich vu cua chung toi. Chuc quy khach mot ngay tot lanh!";

  try {

    const response = await fetch(
      'http://localhost:3000/send-sms',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: customerPhone,
          content: message,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    return data;

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
};