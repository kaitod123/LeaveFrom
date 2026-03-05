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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('fullname');
            
            // +++ สิ่งที่ต้องเพิ่มเข้าไป +++
            $table->string('rank')->nullable();
            $table->string('position')->nullable();
            $table->string('affiliation')->nullable();
            $table->string('duty')->nullable();
            $table->string('phone')->nullable();
            $table->string('status')->default('pending');
            // ++++++++++++++++++++++++

            $table->string('leave_type');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('create_date')->nullable();
            $table->text('reason')->nullable();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
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
