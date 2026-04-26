<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrinterSettingLog extends Model
{
    protected $fillable = [
        'design_id',
        'printer_id',
        'user_id',
        'action',
        'snapshot',
        'changes',
        'logged_at',
    ];

    protected $casts = [
        'snapshot'  => 'array',
        'changes'   => 'array',
        'logged_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }
}
