<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrinterSetting extends Model
{
    protected $fillable = [
        'design_id',
        'printer_id',
        'offset_x',
        'offset_y',
        'width',
        'height',
        'scale',
        'copies',
        'notes',
        'updated_by',
    ];

    protected $casts = [
        'offset_x' => 'float',
        'offset_y' => 'float',
        'width'    => 'float',
        'height'   => 'float',
        'scale'    => 'float',
        'copies'   => 'integer',
    ];

    public function design(): BelongsTo
    {
        return $this->belongsTo(Design::class);
    }

    public function printer(): BelongsTo
    {
        return $this->belongsTo(Printer::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
