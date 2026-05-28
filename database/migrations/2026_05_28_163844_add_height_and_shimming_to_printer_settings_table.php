<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->decimal('height', 8, 2)->nullable()->after('copies');
            $table->boolean('needs_shimming')->default(false)->after('height');
        });
    }

    public function down(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn(['height', 'needs_shimming']);
        });
    }
};
