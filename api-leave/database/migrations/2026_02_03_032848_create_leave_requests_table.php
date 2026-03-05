<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLeaveRequestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('leave_requests', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id'); // Laravel 8 ใช้แบบนี้
        $table->string('fullname');
        $table->string('phone');
        $table->string('leave_type');
        $table->date('start_date');
        $table->date('end_date');
        $table->date('create_date');
        $table->text('reason')->nullable();
        $table->string('pdf_path')->nullable();
        $table->timestamps();

        // เชื่อม Foreign Key
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('leave_requests');
    }
}
