<?php

namespace Database\Seeders;

use App\Models\Printer;
use Illuminate\Database\Seeder;

class PrinterSeeder extends Seeder
{
    public function run(): void
    {
        $printers = [
            ['name' => 'Mimaki', 'model' => 'UJF3042 MkIIe', 'notes' => null],
            ['name' => 'Nocai',  'model' => 'UV6090i-II',    'notes' => null],
        ];

        foreach ($printers as $printer) {
            Printer::updateOrCreate(['name' => $printer['name']], $printer);
        }
    }
}
