<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            PrinterSeeder::class,
            LaptopCatalogSeeder::class,
        ]);

        // Usuario administrador inicial
        User::firstOrCreate(
            ['email' => 'admin@keyboard-designs.local'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
                'role'     => 'admin',
            ]
        );

        // Usuario trabajador de ejemplo
        User::firstOrCreate(
            ['email' => 'daniel@keyboard-designs.local'],
            [
                'name'     => 'Daniel',
                'password' => Hash::make('password'),
                'role'     => 'operator',
            ]
        );
    }
}
