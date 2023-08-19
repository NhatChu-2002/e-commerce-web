import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[]= [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = "";
  searchMode: Boolean = false;

  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
  
  previousKeyword: string = "";
  
  constructor(private productService: ProductService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() =>{
      this.listProducts();
    });
    
  }
  
  listProducts()
  {
      this.searchMode = this.route.snapshot.paramMap.has('keyword');

      if(this.searchMode)
      {
        this.handleSearchProducts();
      }
      else{
        this.handleListProducts();
      }

      
  }
  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();

  }
  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')?.trim()!;

    //if we have different keyword than previous 
    // set the page number to 1

    if(this.previousKeyword != theKeyword)
    {
      this.thePageNumber =1;
    }
    this.previousKeyword = theKeyword;

    console.log(`keyword= ${theKeyword}, thePageNumber=${this.thePageNumber}`);

    //search for products using the keyword
    this.productService.searchProductPaginate(this.thePageNumber - 1,
                                              this.thePageSize,
                                              theKeyword).subscribe(this.processResult())
    ;

  }
  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.thePageNumber  = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements; 
    }
  }

  handleListProducts()
  {
      // check if id parameter is available 
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
 
      // get the "name" param string
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    }
    else{
      this.currentCategoryId = 1;
      this.currentCategoryName = 'Books';
    }

    //
    //  Check if we have a different category that previous 
    // Note: Angular will reuse a component if it is currently being viewed
    //

    // if we have a different category that previous, set page number back to 1
    if(this.previousCategoryId!=this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber} `);

    // get product for the current category id
    this.productService.getProductListPaginate(this.thePageNumber - 1,
                                              this.thePageSize,
                                              this.currentCategoryId)
                                              .subscribe(this.processResult());
  }
}
