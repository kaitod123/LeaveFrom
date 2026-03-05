<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('commanders', function (Blueprint $table) {
            $table->id();
            $table->string('key_match')->unique(); // ชื่อชุด หรือ หน้าที่
            
            // ข้อมูลผู้พิจารณาชั้นต้น (ผู้เสนอ)
            $table->string('cmd_rank')->nullable();
            $table->string('cmd_name')->nullable();
            $table->string('cmd_position')->nullable();
            
            // ข้อมูลผู้บังคับบัญชา (ผู้อนุมัติ)
            $table->string('sup_rank')->nullable();
            $table->string('sup_name')->nullable();
            $table->string('sup_position')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('commanders');
    }
};