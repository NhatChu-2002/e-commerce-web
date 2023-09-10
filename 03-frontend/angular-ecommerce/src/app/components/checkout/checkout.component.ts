import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

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

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  

  checkoutFormGroup: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private luv2shopFormService: Luv2ShopFormService) { }

  ngOnInit(): void {



    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', 
                                  [Validators.required, 
                                  Validators.minLength(2), 
                                  Luv2ShopValidators.notOnlyWhiteSpace]),                    
        lastName: new FormControl('', 
                                  [Validators.required, 
                                  Validators.minLength(2),
                                  Luv2ShopValidators.notOnlyWhiteSpace]),  
        email: new FormControl('', 
                              [Validators.required, 
                              Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required, 
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('',[ Validators.required, 
                                  Validators.minLength(2),
                                  Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('',[ Validators.required]),
        country: new FormControl('',[ Validators.required]),
        zipCode: new FormControl('',[Validators.required, 
                                    Validators.minLength(2),
                                    Luv2ShopValidators.notOnlyWhiteSpace]),
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

    //populate countries
    this.luv2shopFormService.getCountries().subscribe(
      data => {
        console.log("Retrived countries: " + JSON.stringify(data));
        this.countries = data;
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

    if(this.checkoutFormGroup.invalid)
    {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer').value);
    console.log(this.checkoutFormGroup.get('customer').value.email);

    console.log("the shipping address country is " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log("the shipping address state is " + this.checkoutFormGroup.get('shippingAddress').value.state.name);
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName');}
  get lastName() { return this.checkoutFormGroup.get('customer.lastName');}
  get email() { return this.checkoutFormGroup.get('customer.email');}

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipcode() { return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country');}

  copyShippingAddressToBillingAddress(event)
  {
    if(event.target.checked){
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //fix bug copy state
      this.billingAddressStates = this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //fix bug copy state
      this.billingAddressStates = [];
    }
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} countryCode: ${countryCode}`);
    console.log(`${formGroupName} countryName: ${countryName}`);

    this.luv2shopFormService.getStates(countryCode).subscribe(
      data=>{
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else{
          this.billingAddressStates = data;
        }
        //set first value by default
        formGroup.get('state').setValue(data[0]);
      }
    );
  }

}
