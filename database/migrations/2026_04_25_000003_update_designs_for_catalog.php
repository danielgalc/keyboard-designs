<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('designs', function (Blueprint $table) {
            $table->dropColumn(['laptop_brand', 'laptop_model', 'source_language', 'target_language']);
            $table->foreignId('laptop_model_id')->nullable()->after('name')->constrained()->nullOnDelete();
            $table->string('language', 20)->nullable()->after('laptop_model_id');
        });
    }

    public function down(): void
    {
        Schema::table('designs', function (Blueprint $table) {
            $table->dropForeign(['laptop_model_id']);
            $table->dropColumn(['laptop_model_id', 'language']);
            $table->string('laptop_brand')->nullable();
            $table->string('laptop_model')->nullable();
            $table->string('source_language', 10)->nullable();
            $table->string('target_language', 10)->nullable();
        });
    }
};
