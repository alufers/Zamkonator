export interface ProductPricePoint {
    ladder: number;
    usdPrice: number;
    currencyPrice: number;
    cnyPrice: string;
    currencyRate: string;
    currencySymbol: string;
    discountRate?: any;
}

export interface LCSCProduct {
    productId: number;
    productCode: string;
    stock: number;
    stockJs: number;
    stockSz: number;
    stockNumber: number;
    isHot: boolean;
    isPreSale: boolean;
    isDiscount: boolean;
    isAutoOffsale: boolean;
    isEnvironment: boolean;
    isForeignOnsale: boolean;
    isHasBattery: boolean;
    split: number;
    weight: string;
    productModel: string;
    minBuyNumber: number;
    maxBuyNumber: number;
    productUnit: string;
    minPacketUnit: string;
    encapStandard: string;
    productIntroEn: string;
    productDescEn: string;
    isReel: boolean;
    reelPrice?: number;
    brandId: number;
    brandNameEn: string;
    catalogId: number;
    catalogName: string;
    parentCatalogId: number;
    parentCatalogName: string;
    pdfUrl: string;
    productPriceList: ProductPricePoint[];
    productImageUrl?: any;
    productImageUrlBig?: any;
    productImages: any[];
    productArrange: string;
    foreignWeight: string;
    productWeight: string;
    minPacketNumber: number;
    paramVOList: any[];
}

export interface ProductsSearchResponse {
    totalCount: number;
    totalPage: number;
    lastPage: number;
    currentPage: number;
    pageSize: number;
    productList: LCSCProduct[];
}
