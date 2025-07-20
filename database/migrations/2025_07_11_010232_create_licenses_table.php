<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('license_key')->unique();
            $table->bigInteger('duration')->default(0); // duration in seconds
            $table->enum('status', ['unused', 'active', 'expired'])->default('unused');
            $table->string('hwid')->nullable();
            $table->string('description')->nullable();
            $table->boolean('is_lifetime')->default(false);
            $table->date('activated_at')->nullable();
            $table->date('paused_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
