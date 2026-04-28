<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrinterImage extends Model
{
    protected $fillable = [
        'design_id',
        'printer_id',
        'uploaded_by',
        'file_path',
        'file_name',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
