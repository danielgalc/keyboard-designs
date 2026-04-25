<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->string('ink_type', 100)->nullable()->after('notes');
            $table->string('resolution', 20)->nullable()->after('ink_type');
            $table->integer('overprint')->nullable()->after('resolution');
        });
    }

    public function down(): void
    {
        Schema::table('printer_settings', function (Blueprint $table) {
            $table->dropColumn(['ink_type', 'resolution', 'overprint']);
        });
    }
};
