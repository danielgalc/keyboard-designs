<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Verification extends Model
{
    protected $fillable = [
        'design_id',
        'printer_id',
        'user_id',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
