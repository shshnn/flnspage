const WEB3FORMS_URL = "https://api.web3forms.com/submit";

exports.handler = async (event) => {
  const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ success: false, message: "Method not allowed" }) };
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ success: false, message: "문의 전송 설정이 완료되지 않았습니다." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ success: false, message: "잘못된 요청입니다." }),
    };
  }

  const company = String(payload.company || "").trim();
  const manager = String(payload.manager || "").trim();
  const phone = String(payload.phone || "").trim();
  const email = String(payload.email || "").trim();
  const interest = String(payload.interest || "").trim();
  const message = String(payload.message || "").trim();

  if (!company || !manager || !phone || !email || !interest || !message) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ success: false, message: "필수 항목을 모두 입력해 주세요." }),
    };
  }

  const subject = String(payload.subject || "[FLNS] 홈페이지 도입문의 접수").trim();

  try {
    const upstream = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        from_name: "FLNS 홈페이지 문의",
        company,
        manager,
        phone,
        email,
        interest,
        message,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    return {
      statusCode: upstream.ok ? 200 : upstream.status,
      headers: jsonHeaders,
      body: JSON.stringify(data),
    };
  } catch {
    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({ success: false, message: "전송 서버에 연결하지 못했습니다." }),
    };
  }
};
