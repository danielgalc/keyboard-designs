<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin',         'email' => 'admin@keyboard-designs.local',  'role' => 'admin'],
            ['name' => 'Daniel',        'email' => 'daniel@keyboard-designs.local', 'role' => 'operator'],
            ['name' => 'Laura Ibáñez',  'email' => 'laura@keyboard-designs.local',  'role' => 'operator'],
            ['name' => 'Marcos Ruiz',   'email' => 'marcos@keyboard-designs.local', 'role' => 'operator'],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name'     => $user['name'],
                    'password' => Hash::make('password'),
                    'role'     => $user['role'],
                ]
            );
        }
    }
}
