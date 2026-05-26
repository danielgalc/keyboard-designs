<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * PostgreSQL gestiona los enums como CHECK constraints.
     * Añadimos 'dev' al constraint existente.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator', 'dev'))");
    }

    public function down(): void
    {
        // Degradar devs a admin antes de revertir (no dejar filas inválidas)
        DB::statement("UPDATE users SET role = 'admin' WHERE role = 'dev'");
        DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'operator'))");
    }
};
