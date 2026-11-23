<?php

namespace Database\Seeders;

use App\Models\CompositionGroup;
use App\Models\Design;
use App\Models\DesignComment;
use App\Models\DesignFileVersion;
use App\Models\LaptopModel;
use App\Models\Printer;
use App\Models\PrinterImage;
use App\Models\PrinterSetting;
use App\Models\PrinterSettingLog;
use App\Models\Tag;
use App\Models\User;
use App\Models\Verification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DesignSeeder extends Seeder
{
    private User $admin;
    private User $daniel;
    private User $laura;
    private User $marcos;

    private ?Printer $mimakiE;
    private ?Printer $mimaki2;
    private ?Printer $nocai;

    public function run(): void
    {
        $this->admin  = User::where('email', 'admin@keyboard-designs.local')->firstOrFail();
        $this->daniel = User::where('email', 'daniel@keyboard-designs.local')->firstOrFail();
        $this->laura  = User::where('email', 'laura@keyboard-designs.local')->firstOrFail();
        $this->marcos = User::where('email', 'marcos@keyboard-designs.local')->firstOrFail();

        $this->mimakiE = Printer::where('model', 'UJF3042 MkIIe')->first();
        $this->mimaki2 = Printer::where('model', 'UJF3042 MkII')->first();
        $this->nocai   = Printer::where('name', 'Nocai')->first();

        $createdDesigns = [];

        foreach ($this->specs() as $spec) {
            $design = $this->createDesign($spec);
            if ($design) {
                $createdDesigns[$spec['key']] = $design;
            }
        }

        $this->linkComposition($createdDesigns, 'eb840g5-es', 'eb840g5-en');
    }

    /**
     * Definición de los diseños de ejemplo: cubren los 4 tipos de dispositivo,
     * varios idiomas, ambas impresoras Mimaki, y todos los estados de
     * verificación/configuración que refleja el dashboard.
     */
    private function specs(): array
    {
        return [
            [
                'key'         => 'eb840g5-es',
                'brand'       => 'HP', 'model' => 'EliteBook 840 G5',
                'name'        => 'EliteBook 840 G5 — Teclado ES',
                'language'    => 'ES',
                'description' => 'Layout de teclado español para EliteBook 840 G5.',
                'color'       => '#4f46e5',
                'tags'        => ['Repetido'],
                'creator'     => 'daniel', 'daysAgo' => 40,
                'settings'    => [
                    $this->setting('mimakiE', -1.250, 0.800, 0, 1.0000, 2, 'Recordar precalentar bandeja.', 'Acrylic', '600x600', 2, ['C19', 'C1']),
                    $this->setting('nocai', 0.500, -0.300, 0, 1.0000, 1),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'laura', 38, 'Encuadre correcto, colores dentro de tolerancia.'),
                    $this->verification('nocai', 'laura', 38, 'OK.'),
                ],
                'comments' => [
                    ['user' => 'daniel', 'body' => 'Versión validada con el cliente, usar siempre esta plantilla ES.'],
                ],
            ],
            [
                'key'         => 'eb840g5-en',
                'brand'       => 'HP', 'model' => 'EliteBook 840 G5',
                'name'        => 'EliteBook 840 G5 — Teclado EN',
                'language'    => 'EN',
                'description' => 'Variante en inglés del mismo layout físico.',
                'color'       => '#4f46e5',
                'tags'        => ['Repetido'],
                'creator'     => 'daniel', 'daysAgo' => 40,
                'settings'    => [
                    $this->setting('mimakiE', -1.250, 0.800, 0, 1.0000, 2, null, 'Acrylic', '600x600', 2, ['C19', 'C1']),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'laura', 38, 'Mismo encuadre que la versión ES.'),
                ],
            ],
            [
                'key'         => 'eb840g6-es',
                'brand'       => 'HP', 'model' => 'EliteBook 840 G6',
                'name'        => 'EliteBook 840 G6 — Teclado ES',
                'language'    => 'ES',
                'description' => 'Primera subida, pendiente de verificar en planta.',
                'color'       => '#0891b2',
                'creator'     => 'marcos', 'daysAgo' => 3,
                'settings'    => [
                    $this->setting('mimakiE', -0.900, 0.400, 0, 1.0000, 2, null, 'Acrylic', '1200x1200', 3, ['D4']),
                    $this->setting('nocai', 0.200, 0.100, 0, 1.0000, 1),
                ],
            ],
            [
                'key'         => 'pb450g7-pt',
                'brand'       => 'HP', 'model' => 'ProBook 450 G7',
                'name'        => 'ProBook 450 G7 — Frontal PT',
                'language'    => 'PT',
                'description' => 'Frontal en portugués para cliente de Lisboa.',
                'color'       => '#ea580c',
                'tags'        => ['Pendiente revisión'],
                'creator'     => 'daniel', 'daysAgo' => 20,
                'settings'    => [
                    // Configurado en la Mimaki MkII (la segunda unidad) para repartir carga de planta.
                    $this->setting('mimaki2', 0.600, -0.450, 90, 1.0050, 1, 'Girar bandeja 90º antes de imprimir.', 'Acrylic Matte', '600x900', 1, ['A1', 'A2', 'B1']),
                    $this->setting('nocai', -0.100, 0.200, 0, 1.0000, 1),
                ],
                'verifications' => [
                    $this->verification('mimaki2', 'laura', 10, 'Validado en la MkII, sin incidencias.'),
                    $this->verification('nocai', 'laura', 10, 'OK.'),
                ],
                'staleOn' => 'mimaki2', // Se edita después de verificar -> aparece en "pendiente de re-verificar"
            ],
            [
                'key'         => 'lat5420-es',
                'brand'       => 'Dell', 'model' => 'Latitude 5420',
                'name'        => 'Latitude 5420 — Teclado ES',
                'language'    => 'ES',
                'description' => 'Layout estándar, alta rotación de impresión.',
                'color'       => '#15803d',
                'creator'     => 'daniel', 'daysAgo' => 35,
                'settings'    => [
                    $this->setting('mimakiE', 0.300, 0.300, 0, 1.0000, 3, null, 'Acrylic', '600x600', 2, ['E10']),
                    $this->setting('mimaki2', 0.350, 0.250, 0, 1.0000, 3, null, 'Acrylic', '600x600', 2, ['E10']),
                    $this->setting('nocai', -0.200, 0.150, 0, 1.0000, 2),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'laura', 33, 'OK.'),
                    $this->verification('mimaki2', 'marcos', 30, 'Contrastado contra la MkIIe, resultado idéntico.'),
                    $this->verification('nocai', 'laura', 33, 'OK.'),
                ],
                'comments' => [
                    ['user' => 'laura',  'body' => 'He comparado el resultado entre las dos Mimaki, no hay diferencia apreciable.'],
                    ['user' => 'marcos', 'body' => 'Confirmado, podemos repartir este trabajo entre ambas impresoras.'],
                ],
                'fileVersion' => true,
            ],
            [
                'key'         => 'lat7420-fr',
                'brand'       => 'Dell', 'model' => 'Latitude 7420',
                'name'        => 'Latitude 7420 — Teclado FR',
                'language'    => 'FR',
                'description' => 'Pedido urgente para distribuidor francés.',
                'color'       => '#be123c',
                'tags'        => ['Urgente'],
                'creator'     => 'marcos', 'daysAgo' => 2,
                'settings'    => [
                    $this->setting('mimakiE', -0.450, 0.600, 0, 1.0000, 4, 'Entrega mañana a primera hora.', 'Acrylic', '600x600', 3, ['F7']),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'marcos', 1, 'Verificado en caliente, aprobado para producción.'),
                ],
            ],
            [
                'key'         => 'insp3511-es',
                'brand'       => 'Dell', 'model' => 'Inspiron 15 3511',
                'name'        => 'Inspiron 15 3511 — Teclado ES',
                'language'    => 'ES',
                'description' => 'Diseño recién subido, todavía sin encuadrar.',
                'color'       => '#7c3aed',
                'tags'        => ['Nuevo cliente'],
                'creator'     => 'marcos', 'daysAgo' => 0,
            ],
            [
                'key'         => 'tp-t14g2-es',
                'brand'       => 'Lenovo', 'model' => 'ThinkPad T14 Gen 2',
                'name'        => 'ThinkPad T14 Gen 2 — Teclado ES',
                'language'    => 'ES',
                'description' => 'Layout de referencia, usado como plantilla interna.',
                'color'       => '#b91c1c',
                'creator'     => 'daniel', 'daysAgo' => 25,
                'settings'    => [
                    $this->setting('mimakiE', 0.150, -0.200, 0, 1.0000, 2, null, 'Acrylic', '600x1200', 2, ['B9', 'B10']),
                    $this->setting('nocai', 0.100, -0.100, 0, 1.0000, 1),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'laura', 24, 'Encuadre de referencia, no modificar sin aprobación.'),
                    $this->verification('nocai', 'laura', 24, 'OK.'),
                ],
                'printerImage' => 'mimakiE',
            ],
            [
                'key'         => 'x1carbon9-en',
                'brand'       => 'Lenovo', 'model' => 'ThinkPad X1 Carbon Gen 9',
                'name'        => 'ThinkPad X1 Carbon Gen 9 — Teclado EN',
                'language'    => 'EN',
                'description' => 'Carcasa más fina, requiere calce adicional en la Nocai.',
                'color'       => '#0f766e',
                'tags'        => ['Cliente VIP'],
                'creator'     => 'daniel', 'daysAgo' => 15,
                'settings'    => [
                    $this->setting('mimakiE', -0.300, 0.200, 0, 1.0000, 2, null, 'Acrylic', '600x600', 2, ['G14']),
                    array_merge($this->setting('nocai', 0.000, 0.000, 0, 1.0000, 1, 'Usar calzos de 0.5mm, chasis más fino de lo habitual.'), ['height' => 1.80, 'needs_shimming' => true]),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'laura', 14, 'OK.'),
                    $this->verification('nocai', 'laura', 14, 'Confirmado con calzo de 0.5mm.'),
                ],
                'referenceImage' => true,
            ],
            [
                'key'         => 'prodesk400g6-es',
                'brand'       => 'HP', 'model' => 'ProDesk 400 G6',
                'name'        => 'ProDesk 400 G6 — Frontal ES',
                'language'    => 'ES',
                'description' => 'Frontal de torre, primer diseño de este modelo.',
                'color'       => '#1d4ed8',
                'creator'     => 'laura', 'daysAgo' => 8,
                'settings'    => [
                    $this->setting('mimaki2', 0.400, 0.400, 0, 1.0000, 1, null, 'Acrylic', '600x600', 2, ['H2']),
                    $this->setting('nocai', -0.150, 0.050, 0, 1.0000, 1),
                ],
                'verifications' => [
                    $this->verification('mimaki2', 'daniel', 7, 'OK, primer frontal de torre validado.'),
                    $this->verification('nocai', 'daniel', 7, 'OK.'),
                ],
            ],
            [
                'key'         => 'elitedesk800g4-es',
                'brand'       => 'HP', 'model' => 'EliteDesk 800 G4',
                'name'        => 'EliteDesk 800 G4 — Frontal ES',
                'language'    => 'ES',
                'description' => 'Frontal SFF, formato compacto.',
                'color'       => '#a16207',
                'creator'     => 'laura', 'daysAgo' => 5,
                'settings'    => [
                    $this->setting('mimakiE', -0.200, 0.100, 0, 1.0000, 2, null, 'Acrylic', '600x600', 2, ['I5']),
                ],
                'verifications' => [
                    $this->verification('mimakiE', 'daniel', 4, 'OK.'),
                ],
                'referenceImage' => true,
            ],
            [
                'key'         => 'optiplex3080-es',
                'brand'       => 'Dell', 'model' => 'OptiPlex 3080 Mini',
                'name'        => 'OptiPlex 3080 Mini — Frontal ES',
                'language'    => 'ES',
                'description' => 'Formato mini, configurado en la Mimaki MkII a falta de verificar.',
                'color'       => '#be185d',
                'creator'     => 'marcos', 'daysAgo' => 1,
                'settings'    => [
                    $this->setting('mimaki2', 0.100, -0.100, 0, 1.0000, 1, null, 'Acrylic', '600x600', 1, ['J3']),
                ],
            ],
        ];
    }

    private function setting(
        string $printerKey,
        float $offsetX,
        float $offsetY,
        int $rotation,
        float $scale,
        int $copies,
        ?string $notes = null,
        ?string $inkType = null,
        ?string $resolution = null,
        ?int $overprint = null,
        array $screwPositions = [],
    ): array {
        return compact('printerKey', 'offsetX', 'offsetY', 'rotation', 'scale', 'copies', 'notes', 'inkType', 'resolution', 'overprint', 'screwPositions');
    }

    private function verification(string $printerKey, string $userKey, int $daysAgo, ?string $notes = null): array
    {
        return compact('printerKey', 'userKey', 'daysAgo', 'notes');
    }

    private function createDesign(array $spec): ?Design
    {
        $model = LaptopModel::whereHas('brand', fn ($q) => $q->where('name', $spec['brand']))
            ->where('name', $spec['model'])
            ->first();

        if (!$model) {
            return null;
        }

        $existing = Design::where('name', $spec['name'])->where('laptop_model_id', $model->id)->first();
        if ($existing) {
            return $existing;
        }

        $creator = $this->user($spec['creator']);
        $createdAt = Carbon::now()->subDays($spec['daysAgo']);

        $image = $this->makeDesignImage($spec['name'], $spec['description'] ?? '', $spec['color']);
        $fileName = Str::slug($spec['name']) . '.png';
        Storage::disk('local')->put('designs/' . $fileName, $image);

        $design = new Design([
            'name'            => $spec['name'],
            'laptop_model_id' => $model->id,
            'language'        => $spec['language'] ?? null,
            'description'     => $spec['description'] ?? null,
            'file_path'       => 'designs/' . $fileName,
            'file_name'       => $fileName,
            'file_mime_type'  => 'image/png',
            'file_size'       => strlen($image),
            'created_by'      => $creator->id,
        ]);
        $design->timestamps = false;
        $design->created_at = $createdAt;
        $design->updated_at = $createdAt;
        $design->save();

        if (!empty($spec['tags'])) {
            $tagIds = Tag::whereIn('name', $spec['tags'])->pluck('id');
            $design->tags()->sync($tagIds);
        }

        foreach ($spec['settings'] ?? [] as $settingSpec) {
            $this->createSetting($design, $settingSpec, $creator, $createdAt);
        }

        foreach ($spec['verifications'] ?? [] as $verificationSpec) {
            $this->createVerification($design, $verificationSpec);
        }

        foreach ($spec['comments'] ?? [] as $i => $commentSpec) {
            DesignComment::create([
                'design_id' => $design->id,
                'user_id'   => $this->user($commentSpec['user'])->id,
                'body'      => $commentSpec['body'],
            ]);
        }

        if (!empty($spec['staleOn'])) {
            $this->makeSettingStale($design, $spec['staleOn']);
        }

        if (!empty($spec['fileVersion'])) {
            $oldImage = $this->makeDesignImage($spec['name'], 'Versión anterior, sustituida por ' . $creator->name, '#94a3b8');
            $oldFileName = Str::slug($spec['name']) . '-v1.png';
            Storage::disk('local')->put('designs/old/' . $oldFileName, $oldImage);

            DesignFileVersion::create([
                'design_id'      => $design->id,
                'replaced_by'    => $creator->id,
                'file_name'      => $oldFileName,
                'file_path'      => 'designs/old/' . $oldFileName,
                'file_size'      => strlen($oldImage),
                'version_number' => 1,
            ]);
        }

        if (!empty($spec['printerImage'])) {
            $this->createPrinterImage($design, $spec['printerImage']);
        }

        if (!empty($spec['referenceImage'])) {
            $this->attachReferenceImage($design, $spec['name'], $spec['color']);
        }

        return $design;
    }

    private function createSetting(Design $design, array $settingSpec, User $creator, Carbon $createdAt): PrinterSetting
    {
        $printer = $this->printer($settingSpec['printerKey']);

        $setting = $design->printerSettings()->make([
            'printer_id'      => $printer->id,
            'offset_x'        => $settingSpec['offsetX'],
            'offset_y'        => $settingSpec['offsetY'],
            'rotation'        => $settingSpec['rotation'],
            'scale'           => $settingSpec['scale'],
            'copies'          => $settingSpec['copies'],
            'height'          => $settingSpec['height'] ?? null,
            'needs_shimming'  => $settingSpec['needs_shimming'] ?? false,
            'notes'           => $settingSpec['notes'],
            'ink_type'        => $settingSpec['inkType'],
            'resolution'      => $settingSpec['resolution'],
            'overprint'       => $settingSpec['overprint'],
            'screw_positions' => $settingSpec['screwPositions'] ?: null,
            'updated_by'      => $creator->id,
        ]);
        // Backdatear para que la comparación "editado después de verificar" del dashboard
        // sea correcta salvo donde se simula explícitamente una edición posterior (staleOn).
        $setting->timestamps = false;
        $setting->created_at = $createdAt;
        $setting->updated_at = $createdAt;
        $design->printerSettings()->save($setting);

        PrinterSettingLog::create([
            'design_id'  => $design->id,
            'printer_id' => $printer->id,
            'user_id'    => $creator->id,
            'action'     => 'created',
            'snapshot'   => $setting->only([
                'offset_x', 'offset_y', 'rotation', 'scale', 'copies',
                'height', 'needs_shimming', 'notes', 'ink_type', 'resolution', 'overprint',
            ]),
            'changes'    => null,
            'logged_at'  => $createdAt,
        ]);

        return $setting;
    }

    private function createVerification(Design $design, array $verificationSpec): Verification
    {
        $printer = $this->printer($verificationSpec['printerKey']);

        return Verification::create([
            'design_id'   => $design->id,
            'printer_id'  => $printer->id,
            'user_id'     => $this->user($verificationSpec['userKey'])->id,
            'verified_at' => Carbon::now()->subDays($verificationSpec['daysAgo']),
            'notes'       => $verificationSpec['notes'],
        ]);
    }

    private function makeSettingStale(Design $design, string $printerKey): void
    {
        $printer = $this->printer($printerKey);
        $setting = $design->printerSettings()->where('printer_id', $printer->id)->first();
        if (!$setting) {
            return;
        }

        $before = $setting->offset_x;
        $setting->offset_x = $before + 0.400;
        $setting->notes = trim(($setting->notes ?? '') . ' Reajustado tras detectar ligera deriva de encuadre.');
        $setting->save();

        PrinterSettingLog::create([
            'design_id'  => $design->id,
            'printer_id' => $printer->id,
            'user_id'    => $setting->updated_by,
            'action'     => 'updated',
            'snapshot'   => $setting->only([
                'offset_x', 'offset_y', 'rotation', 'scale', 'copies',
                'height', 'needs_shimming', 'notes', 'ink_type', 'resolution', 'overprint',
            ]),
            'changes'    => ['offset_x' => ['from' => $before, 'to' => $setting->offset_x]],
            'logged_at'  => now(),
        ]);
    }

    private function createPrinterImage(Design $design, string $printerKey): void
    {
        $printer = $this->printer($printerKey);
        $image = $this->makeDesignImage($design->name, 'Encuadre en bandeja ' . $printer->name, '#334155');
        $fileName = 'encuadre-' . Str::slug($design->name) . '.png';
        $path = "printer-images/{$design->id}/{$printer->id}/{$fileName}";
        Storage::disk('local')->put($path, $image);

        PrinterImage::create([
            'design_id'   => $design->id,
            'printer_id'  => $printer->id,
            'uploaded_by' => $this->daniel->id,
            'file_path'   => $path,
            'file_name'   => $fileName,
            'file_size'   => strlen($image),
        ]);
    }

    private function attachReferenceImage(Design $design, string $title, string $color): void
    {
        $image = $this->makeReferenceImage($title, $color);
        $fileName = 'ref-' . Str::slug($title) . '.png';
        $path = "reference-images/{$design->id}/{$fileName}";
        Storage::disk('local')->put($path, $image);

        $design->update(['reference_image' => $path]);
    }

    private function linkComposition(array $designs, string $keyA, string $keyB): void
    {
        if (!isset($designs[$keyA], $designs[$keyB])) {
            return;
        }

        $group = CompositionGroup::create();
        $group->designs()->sync([$designs[$keyA]->id, $designs[$keyB]->id]);
    }

    private function user(string $key): User
    {
        return match ($key) {
            'admin'  => $this->admin,
            'daniel' => $this->daniel,
            'laura'  => $this->laura,
            'marcos' => $this->marcos,
        };
    }

    private function printer(string $key): Printer
    {
        return match ($key) {
            'mimakiE' => $this->mimakiE,
            'mimaki2' => $this->mimaki2,
            'nocai'   => $this->nocai,
        };
    }

    /**
     * Genera una imagen PNG de ejemplo que simula una rejilla de teclas,
     * para que la vista previa del diseño muestre contenido real.
     */
    private function makeDesignImage(string $title, string $subtitle, string $hexColor): string
    {
        [$r, $g, $b] = $this->hexToRgb($hexColor);

        $width = 1000;
        $height = 620;
        $im = imagecreatetruecolor($width, $height);

        $bg = imagecolorallocate($im, 245, 246, 250);
        imagefill($im, 0, 0, $bg);

        $header = imagecolorallocate($im, $r, $g, $b);
        imagefilledrectangle($im, 0, 0, $width, 80, $header);

        $white = imagecolorallocate($im, 255, 255, 255);
        imagestring($im, 5, 20, 28, substr($title, 0, 60), $white);

        $gray = imagecolorallocate($im, 90, 95, 105);
        imagestring($im, 3, 20, 95, substr($subtitle, 0, 90), $gray);

        $keyFill = imagecolorallocate($im, min(255, $r + 90), min(255, $g + 90), min(255, $b + 90));
        $keyBorder = imagecolorallocate($im, 205, 208, 214);

        $cols = 14;
        $rows = 5;
        $marginX = 20;
        $marginTop = 130;
        $keyW = (int) (($width - $marginX * 2) / $cols) - 6;
        $keyH = (int) (($height - $marginTop - 20) / $rows) - 6;

        for ($row = 0; $row < $rows; $row++) {
            for ($col = 0; $col < $cols; $col++) {
                $x = $marginX + $col * ($keyW + 6);
                $y = $marginTop + $row * ($keyH + 6);
                imagefilledrectangle($im, $x, $y, $x + $keyW, $y + $keyH, $keyFill);
                imagerectangle($im, $x, $y, $x + $keyW, $y + $keyH, $keyBorder);
            }
        }

        ob_start();
        imagepng($im);
        $data = ob_get_clean();
        imagedestroy($im);

        return $data;
    }

    /**
     * Genera una imagen PNG de ejemplo que simula una foto de referencia del dispositivo.
     */
    private function makeReferenceImage(string $title, string $hexColor): string
    {
        [$r, $g, $b] = $this->hexToRgb($hexColor);

        $width = 900;
        $height = 600;
        $im = imagecreatetruecolor($width, $height);

        $bg = imagecolorallocate($im, 30, 33, 40);
        imagefill($im, 0, 0, $bg);

        $body = imagecolorallocate($im, $r, $g, $b);
        imagefilledrectangle($im, 150, 120, 750, 420, $body);

        $screen = imagecolorallocate($im, 20, 22, 26);
        imagefilledrectangle($im, 190, 150, 710, 320, $screen);

        $white = imagecolorallocate($im, 255, 255, 255);
        imagestring($im, 4, 160, 440, 'FOTO DE REFERENCIA', $white);
        imagestring($im, 3, 160, 465, substr($title, 0, 70), $white);

        ob_start();
        imagepng($im);
        $data = ob_get_clean();
        imagedestroy($im);

        return $data;
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        return [
            hexdec(substr($hex, 0, 2)),
            hexdec(substr($hex, 2, 2)),
            hexdec(substr($hex, 4, 2)),
        ];
    }
}
