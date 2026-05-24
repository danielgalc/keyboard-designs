<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido/a a Keyboard Designs</title>
    <style>
        /* Spoiler: hover revela la contraseña (Apple Mail, Outlook escritorio, Thunderbird) */
        .pwd-spoiler:hover {
            color: #1e293b !important;
            text-shadow: none !important;
        }
    </style>
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
                                ¡Hola, {{ $user->name }}!
                            </h1>
                            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                                Tu cuenta en <strong style="color:#0f172a;">Keyboard Designs</strong> ha sido creada por un administrador. Ya puedes acceder con las siguientes credenciales:
                            </p>

                            <!-- Credentials box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                                <tr>
                                    <td style="padding:20px 24px;">
                                        <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">Email</p>
                                        <p style="margin:0 0 16px;font-size:15px;color:#1e293b;font-weight:500;">{{ $user->email }}</p>
                                        <div style="border-top:1px solid #e2e8f0;padding-top:16px;">
                                            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">Contraseña</p>
                                            <!-- Spoiler: texto invisible hasta hover. En Gmail: selecciona el bloque para copiarla. -->
                                            <span
                                                class="pwd-spoiler"
                                                title="Pasa el cursor para revelar"
                                                style="display:inline-block;font-size:15px;font-weight:500;font-family:'Courier New',monospace;background-color:#1e293b;color:#1e293b;text-shadow:0 0 8px rgba(255,255,255,0.15);padding:6px 14px;border-radius:6px;cursor:pointer;user-select:all;letter-spacing:0.05em;"
                                            >{{ $plainPassword }}</span>
                                            <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">Pasa el cursor encima para revelarla · o selecciona el texto para copiarla</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA -->
                            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td style="border-radius:8px;background-color:#4f46e5;">
                                        <a href="{{ url('/login') }}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                                            Acceder ahora →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
                                <tr>
                                    <td style="padding:14px 18px;">
                                        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                                            <strong>Recomendación:</strong> Por seguridad, cambia esta contraseña desde tu perfil una vez hayas iniciado sesión.
                                        </p>
                                    </td>
                                </tr>
                            </table>
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
