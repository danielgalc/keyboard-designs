<?php

namespace Database\Seeders;

use App\Models\LaptopBrand;
use App\Models\LaptopModel;
use Illuminate\Database\Seeder;

class LaptopCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'HP' => [
                'EliteBook 840 G5',
                'EliteBook 840 G6',
                'EliteBook 840 G8',
                'ProBook 450 G7',
                'ProBook 450 G8',
            ],
            'Dell' => [
                'Latitude 5420',
                'Latitude 5520',
                'Latitude 7420',
                'Inspiron 15 3511',
                'Vostro 3520',
            ],
            'Lenovo' => [
                'ThinkPad E15 Gen 2',
                'ThinkPad T14 Gen 2',
                'ThinkPad L15 Gen 1',
                'IdeaPad 5 15ITL05',
                'ThinkPad X1 Carbon Gen 9',
            ],
        ];

        foreach ($catalog as $brandName => $models) {
            $brand = LaptopBrand::firstOrCreate(['name' => $brandName]);

            foreach ($models as $modelName) {
                LaptopModel::firstOrCreate([
                    'laptop_brand_id' => $brand->id,
                    'name'            => $modelName,
                ]);
            }
        }
    }
}
