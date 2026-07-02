export function getStatusChangeEmailHtml(reportCode: string, oldStatus: string, newStatus: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-bottom: 20px;">Atualização de Status de Denúncia</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">
        A denúncia <strong>${reportCode}</strong> teve seu status alterado.
      </p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #475569; font-size: 14px;">Status anterior: <span style="color: #64748b;">${oldStatus}</span></p>
        <p style="margin: 5px 0 0; color: #0f172a; font-weight: bold; font-size: 15px;">Novo status: ${newStatus}</p>
      </div>

      <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 15px;">
        Este é um e-mail automático gerado pelo sistema AnonProtect. Por favor, não responda.
      </p>
    </div>
  `
}
