<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activa tu cuenta en Keyboard Designs</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#1e293b;border-radius:12px 12px 0 0;padding:28px 40px;">
                            <span style="display:inline-block;background-color:#4f46e5;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                                KEYBOARD DESIGNS
                            </span>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="background-color:#ffffff;padding:36px 40px 32px;">
                            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
                                ¡Bienvenido/a, {{ $user->name }}!
                            </h1>
                            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                                Un administrador ha creado tu cuenta en <strong style="color:#0f172a;">Keyboard Designs</strong>. Para activarla, establece tu contraseña haciendo clic en el botón de abajo:
                            </p>

                            <!-- CTA principal -->
                            <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                <tr>
                                    <td style="border-radius:8px;background-color:#4f46e5;">
                                        <a href="{{ $setupUrl }}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                                            Establecer mi contraseña →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:16px 20px;">
                                        <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">Tu email de acceso</p>
                                        <p style="margin:0;font-size:15px;color:#1e293b;font-weight:500;">{{ $user->email }}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Aviso caducidad -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                                            Este enlace caduca en <strong>24 horas</strong>. Si expira, contacta con el administrador para que te envíe uno nuevo.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                                Si no esperabas este email, puedes ignorarlo. No se realizará ningún cambio hasta que hagas clic en el enlace.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:20px 40px;">
                            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                                Keyboard Designs &nbsp;&middot;&nbsp; Built by Pulsia Itech &nbsp;&middot;&nbsp; &copy; Daniel Gallego {{ date('Y') }}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
