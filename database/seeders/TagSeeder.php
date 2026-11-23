<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = ['Urgente', 'Repetido', 'Cliente VIP', 'Pendiente revisión', 'Nuevo cliente'];

        foreach ($tags as $name) {
            Tag::firstOrCreate(['name' => $name]);
        }
    }
}
