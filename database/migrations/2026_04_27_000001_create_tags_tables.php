<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
            $table->timestamps();
        });

        Schema::create('design_tag', function (Blueprint $table) {
            $table->foreignId('design_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['design_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_tag');
        Schema::dropIfExists('tags');
    }
};
