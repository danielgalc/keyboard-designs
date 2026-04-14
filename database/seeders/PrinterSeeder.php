<?php

namespace Database\Seeders;

use App\Models\Printer;
use Illuminate\Database\Seeder;

class PrinterSeeder extends Seeder
{
    public function run(): void
    {
        $printers = [
            [
                'name'  => 'Mimaki',
                'model' => 'UJF3042 MkIIe',
                'notes' => null,
            ],
            [
                'name'  => 'Nocai',
                'model' => null, // Actualizar cuando se conozca el modelo exacto
                'notes' => null,
            ],
        ];

        foreach ($printers as $printer) {
            Printer::firstOrCreate(
                ['name' => $printer['name']],
                $printer
            );
        }
    }
}
