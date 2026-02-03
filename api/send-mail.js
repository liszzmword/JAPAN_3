const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = 'liszzmword@gmail.com';
const FROM_EMAIL = 'Japanese Quiz Contact <onboarding@resend.dev>';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: '이메일 설정이 되어 있지 않습니다. RESEND_API_KEY를 설정해 주세요.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: '잘못된 요청입니다.' });
  }

  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();

  if (!name || !phone || !email) {
    return res.status(400).json({ error: '이름, 전화번호, 이메일을 모두 입력해 주세요.' });
  }

  const subject = '[일본어 퀴즈] 일본인 친구 매칭 문의';
  const html = `
    <h2>일본인 친구 매칭 문의</h2>
    <p>일본어 퀴즈 사이트 컨택 폼에서 제출되었습니다.</p>
    <ul>
      <li><strong>이름:</strong> ${escapeHtml(name)}</li>
      <li><strong>전화번호:</strong> ${escapeHtml(phone)}</li>
      <li><strong>이메일:</strong> ${escapeHtml(email)}</li>
    </ul>
    <p><small>보낸 시각: ${new Date().toLocaleString('ko-KR')}</small></p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message || '이메일 전송에 실패했습니다.' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Send mail error:', err);
    return res.status(500).json({ error: '이메일 전송 중 오류가 발생했습니다.' });
  }
};

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, function (c) { return map[c] || c; });
}
