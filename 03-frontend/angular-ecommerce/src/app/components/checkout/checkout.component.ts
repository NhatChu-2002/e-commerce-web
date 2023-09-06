import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number=0;
  totalQuantity: number=0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];



  checkoutFormGroup: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private luv2shopFormService: Luv2ShopFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName:[''],
        lastName:[''],
        email:['']
      }),

      shippingAddress: this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:[''],
      }),

      billingAddress: this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:['']
      }),
      creditCard: this.formBuilder.group({
        cardType:[''],
        nameOnCard:[''],
        cardNumber:[''],
        securityCode:[''],
        expirationMonth:[''],
        expirationYear:['']
      }),
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth()+1;
    console.log("startMonnth: " + startMonth);
    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    //populate credit card years
    this.luv2shopFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrived credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
  }
  handleMonthAndYears()
  {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear = new Date().getFullYear();
    const selectedYear:number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;
    if(currentYear == selectedYear)
    {
      startMonth = new Date().getMonth()+1;
    }
    else{
      startMonth=1;
    }
    this.luv2shopFormService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths=data;
      }
    );
  }
  onSubmit()
  {
    console.log("Handling submit button");
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log(this.checkoutFormGroup.get('customer').value.email);
  }
  copyShippingAddressToBillingAddress(event)
  {
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

}
