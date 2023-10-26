import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/service/cart.service';
import { CommonService } from 'src/service/common.service';
import { RedeempointsService } from 'src/service/redeempoints.service';
import { ApiService } from 'src/service/testapi.service';
import { coupons } from 'src/utils/coupons';

declare var Razorpay: any;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  isChecked: boolean;
  isApplied: boolean;
  isCheckout: boolean;
  totalPoints: number;
  discountPoints: number;
  redeemDiscount: number;
  deliveryAmount: number;
  totalAmount: number;
  finalAmount: number;
  cart: any;
  allCoupons: any;
  validCoupons: any[];
  couponValue: any = {};
  newCartObject: any = {};

  @Input() fromCheckout: boolean;

  constructor(
    private pointService: RedeempointsService,
    private cartService: CartService,
    private router: Router,
    private commonService: CommonService,
    private apiService: ApiService
  ) {
    this.isChecked = false;
    this.isApplied = false;
    this.isCheckout = false;
    this.totalPoints = this.pointService.getPoints();
    this.discountPoints = 0;
    this.totalAmount = 0;
    this.finalAmount = 0;
    this.deliveryAmount = 0;
    this.redeemDiscount = 0;
    this.validCoupons = [];
    this.fromCheckout = false;
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.allCoupons = coupons;
    this.cartService.cart$.subscribe((data) => {
      this.cart = data;
      console.log(this.cart);
      this.updateCartDetails();
    });
    if (this.fromCheckout) {
      this.apiService.getOrder().subscribe(
        (data) => {
          console.log('from checkout', data);
        },
        (error) => {
          console.log('Error', error);
        }
      );
    }
  }

  updateCartDetails() {
    this.totalAmount = this.cartTotal();
    this.deliveryAmount = this.totalAmount > 1000 ? 0 : 49;
    this.finalAmount = this.finalTotal(this.deliveryAmount);
    this.isCheckout = true;
    for (const item of this.cart) {
      if (!item.selectedSize) {
        this.isCheckout = false;
        break;
      }
    }
    this.totalPoints = this.pointService.getPoints();
    this.discountPoints = this.pointService.redeemPoints(this.totalAmount);
    this.validCoupons = this.allCoupons.filter(
      (item: any) => this.totalAmount > item.minAmount
    );
    this.handleCoupon({});
    this.isChecked = false;
  }

  deleteAll(){
    this.cartService.deleteAll(this.cart);
  }

  handleApply(item: any) {
    if (Object.keys(item).length === 0) {
    }
    if (this.totalAmount > item.minAmount) {
      this.redeemDiscount = Math.ceil((item.value / 100) * this.totalAmount);
      this.isApplied = true;
      this.finalAmount = this.finalTotal(
        this.deliveryAmount,
        this.isChecked ?this.discountPoints:0,
        this.redeemDiscount
      );
    }
  }

  handleCoupon(coupon: any) {
    if (Object.keys(coupon).length === 0) {
      this.redeemDiscount = 0;
      this.finalAmount = this.finalTotal(
        this.deliveryAmount,
        this.isChecked ?this.discountPoints:0,
        this.redeemDiscount
      );
    }
    this.couponValue = coupon;
  }
  handleCheckout() {
    const summary = {
      subtotal: this.totalAmount,
      shipping: this.deliveryAmount,
      couponsDiscount: this.redeemDiscount,
      couponCode: this.couponValue.code,
      redeemPoints: this.discountPoints,
      finalAmount: this.finalAmount,
    };
    // this.pointService.addPoints(this.finalAmount);
    this.commonService.postCheckoutStatus(true);
    this.newCartObject = { cart: this.cart, summary: summary };
    // this.commonService.addOrder(this.newCartObject);
    this.router.navigate(['/checkout']);
    if (this.fromCheckout) {
      this.router.navigate(['/cart']);
      this.payNow();
    }
  }
  handleRedeem() {
    this.isChecked = !this.isChecked;
    this.discountPoints = this.pointService.redeemPoints(this.totalAmount);
    this.finalAmount = this.finalTotal(
      this.deliveryAmount,
      this.isChecked ?this.discountPoints:0,
      this.redeemDiscount
    );
  }

  handlerFunc(response: any) {
    let redirect_url = '';
    if (
      typeof response.razorpay_payment_id == 'undefined' ||
      response.razorpay_payment_id === null
      ) {
        redirect_url = '/cart';
      } else {
        this.pointService.addPoints(this.finalAmount)
        redirect_url = '/';
      }
      location.href = redirect_url;
    }
    
    payNow() {
    const RazorpayOptions = {
      description: 'Sample Razorpay demo',
      currency: 'INR',
      amount: this.finalAmount * 100,
      name: 'Cartlog',
      key: 'rzp_test_GDSj4cCXe0vwu8',
      handler: (response: any) => {
        this.handlerFunc(response);
      },
      image: 'https://img.logoipsum.com/274.svg',
      prefill: {
        name: 'Snehal',
        email: 'snehal@gmail.com',
        phone: '9898989898',
      },
      theme: {
        color: '#6466e3',
      },
      modal: {
        ondismiss: () => {
          console.log('dismissed');
        },
      },
    };

    const successCallback = (paymentid: any) => {
      console.log(paymentid);
      this.router.navigate(['/']);
    };

    const failureCallback = (e: any) => {
      console.log(e);
    };

    Razorpay.open(RazorpayOptions, successCallback, failureCallback);
  }

  cartTotal(): number {
    let total = 0;
    for (const item of this.cart) {
      total += item.price * item.qty;
    }
    return total;
  }

  finalTotal(
    deliveryPoints: number,
    redeemPoints?: number,
    couponPoints?: number
  ): number {
    return (
      Math.ceil(this.totalAmount +
      deliveryPoints -
      (redeemPoints || 0) -
      (couponPoints || 0)
    ));
  }
}
