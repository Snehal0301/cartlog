import { Component, Input } from '@angular/core';
import ShortUniqueId from 'short-unique-id';

import { ActivatedRoute, Router } from '@angular/router';
import { AuthGuardService } from 'src/service/auth-guard.service';
import { CartService } from 'src/service/cart.service';
import { CommonService } from 'src/service/common.service';
import { OrderService } from 'src/service/order.service';
import { RedeempointsService } from 'src/service/redeempoints.service';
import { ApiService } from 'src/service/testapi.service';
import { coupons } from 'src/utils/coupons';
import { CouponService } from 'src/service/coupon.service';
import { DatePipe } from '@angular/common';

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
  onlyGiftCard: boolean;
  totalPoints: number;
  discountPoints: number;
  redeemDiscount: number;
  deliveryAmount: number;
  totalAmount: number;
  finalAmount: number;
  orderID: any;
  orderIDLS: any;
  cart: any;
  allCoupons: any;
  allOrder: any;
  singleOrderData: any;
  validCoupons: any[];
  couponValue: any = {};
  newCartObject: any = {};

  @Input() fromCheckout: boolean;
  @Input() enableCheckout: boolean;
  @Input() selectedAddress: any;

  constructor(
    private datePipe: DatePipe,
    private pointService: RedeempointsService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthGuardService,
    private couponService: CouponService,
    private apiService: ApiService,
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) {
    this.isChecked = false;
    this.isApplied = false;
    this.isCheckout = false;
    this.enableCheckout = false;
    this.totalPoints = this.pointService.getPoints();
    this.discountPoints = 0;
    this.totalAmount = 0;
    this.finalAmount = 0;
    this.orderID;
    this.orderIDLS;
    this.deliveryAmount = 0;
    this.redeemDiscount = 0;
    this.validCoupons = [];
    this.fromCheckout = false;
    this.onlyGiftCard = false;

    this.route.paramMap.subscribe((params) => {
      this.orderID = params.get('order');
    });
  }
  ngOnInit() {
    window.scrollTo(0, 0);
    // this.fetchCoupons();
    // this.allCoupons = coupons;
    this.couponService.coupon$.subscribe((data) => {
      this.allCoupons = data;
    });
    this.cartService.cart$.subscribe((data) => {
      this.cart = data;
      this.updateCartDetails();
      if(this.cart.length === 0){
        this.orderService.deleteorder(this.orderIDLS)
        localStorage.removeItem('orderIDLS')
      }
    });
    this.orderService.order$.subscribe((data) => {
      this.allOrder = data;
    });
    this.orderIDLS = localStorage.getItem('orderIDLS');
    if (this.fromCheckout) {
      this.getSingleOrder(this.orderID);
    }
  }

  updateCartDetails() {
    this.totalAmount = this.cartTotal();
    // this.deliveryAmount = this.totalAmount > 1000 ? 0 : 49;
    let productAmnt = this.productTotal();
    let giftAmnt = this.giftTotal();
    this.deliveryAmount = 0;
    if (productAmnt === 0) {
      // Cart contains only gift cards
      this.onlyGiftCard = true;
      this.deliveryAmount = 0;
    } else if (giftAmnt === 0) {
      this.onlyGiftCard = false;
      // Cart contains only products
      if (this.totalAmount < 1000) {
        this.deliveryAmount = 49;
      }
    } else {
      // Cart contains both products and gift cards
      this.onlyGiftCard = false;
      if (this.totalAmount < 1000) {
        this.deliveryAmount = 49;
      }
    }
    this.finalAmount = this.finalTotal(this.deliveryAmount);
    this.isCheckout = true;
    for (const item of this.cart) {
      if (!item.isGiftCard && !item.selectedSize) {
        this.isCheckout = false;
        break;
      }
    }
    this.totalPoints = this.pointService.getPoints();
    this.discountPoints = this.pointService.redeemPoints(this.totalAmount);
    this.validCoupons = this.allCoupons?.filter(
      (item: any) => this.totalAmount > item.minAmount && !item.isUsed
    );
    this.handleCoupon({});
    this.isChecked = false;
  }

  deleteAll() {
    this.cartService.deleteAll(this.cart);
  }

  handleApply(item: any) {
    console.log(this.couponValue);
    if (Object.keys(item).length === 0) {
    }
    if (this.totalAmount > item.minAmount) {
      this.redeemDiscount = Math.ceil((item.value / 100) * this.totalAmount);
      // localStorage.setItem('redeeemDiscount',JSON.stringify(this.redeemDiscount))
      this.isApplied = true;
      this.finalAmount = this.finalTotal(
        this.deliveryAmount,
        this.isChecked ? this.discountPoints : 0,
        this.redeemDiscount
      );
    }
  }

  handleCoupon(coupon: any) {
    if (Object.keys(coupon).length === 0) {
      this.redeemDiscount = 0;
      this.finalAmount = this.finalTotal(
        this.deliveryAmount,
        this.isChecked ? this.discountPoints : 0,
        this.redeemDiscount
      );
    }
    this.couponValue = coupon;
  }

  handleCheckout() {
    if (this.fromCheckout) {
      this.singleOrderData.address = this.selectedAddress;
      const today = new Date();
      this.singleOrderData.date = this.datePipe.transform(today, 'dd MMM yyyy');
      this.editOrder(this.orderIDLS, this.singleOrderData);
      this.payNow();
    } else {
      const summary = {
        subtotal: this.totalAmount,
        shipping: this.deliveryAmount,
        couponsDiscount: this.redeemDiscount,
        couponCode: this.couponValue.code,
        redeemPoints: this.discountPoints,
        finalAmount: this.finalAmount,
        isChecked: this.isChecked,
      };
      if (this.orderIDLS) {
        let updatedOrder = {
          cart: this.cart,
          summary: summary,
        };
        this.editOrder(this.orderIDLS, updatedOrder);
      } else {
        this.addOrder(summary);
      }
    }

    // this.authService.updateCheckoutStatus(true);
    // this.router.navigate(['/checkout', this.orderID]);
  }

  // handleCheckout() {
  //   if (this.fromCheckout) {
  //     this.payNow();
  //   } else {
  //     const summary = {
  //       subtotal: this.totalAmount,
  //       shipping: this.deliveryAmount,
  //       couponsDiscount: this.redeemDiscount,
  //       couponCode: this.couponValue.code,
  //       redeemPoints: this.discountPoints,
  //       finalAmount: this.finalAmount,
  //       isChecked: this.isChecked,
  //     };
  //     // const uid = new ShortUniqueId({
  //     //   dictionary: 'alphanum_upper',
  //     //   length: 11,
  //     // });
  //     // this.newCartObject = {
  //     //   cart: this.cart,
  //     //   summary: summary,
  //     //   id: `ORD` + uid.rnd(),
  //     // };
  //     this.orderID = this.newCartObject.id;
  //     // this.orderService.addOrder(this.newCartObject).then((result) => {
  //     //   if (result) {
  //     //     console.log('added order');
  //     //   } else {
  //     //     console.log('error in adding order');
  //     //   }
  //     // });
  //     if (this.orderID) {
  //       let updatedOrder = {
  //         cart: this.cart,
  //         summary: summary,
  //       };
  //       this.editOrder(this.orderID, updatedOrder);
  //     } else {
  //       this.addOrder(summary);
  //     }
  //     // console.log(this.couponValue);
  //     // const selectedCoupon = coupons.find(
  //     //   (coupon: any) => coupon.code === this.couponValue.code
  //     // );
  //     // if (selectedCoupon && !selectedCoupon.isUsed) {
  //     //   selectedCoupon.isUsed = true;
  //     // }
  //     this.authService.updateCheckoutStatus(true);
  //     this.router.navigate(['/checkout', this.orderID]);
  //   }
  // }

  handleRedeem() {
    this.isChecked = !this.isChecked;
    this.discountPoints = this.pointService.redeemPoints(this.totalAmount);
    this.finalAmount = this.finalTotal(
      this.deliveryAmount,
      this.isChecked ? this.discountPoints : 0,
      this.redeemDiscount
    );
  }

  editCoupon(id: string, item: any) {
    this.couponService.updatedCoupon(id, item).then((result) => {
      if (result) {
        console.log('coupon edited');
      } else {
        console.log('error in coupon edition');
      }
    });
  }

  handlerFunc(response: any) {
    let redirect_url = '';
    // const simulateFailure = true;
    if (
      typeof response.razorpay_payment_id == 'undefined' ||
      response.razorpay_payment_id === null
    ) 
    // if (
    //   simulateFailure
    // ) 
    {
      let updatedOrder = this.singleOrderData;
      updatedOrder.status = 'Failed';
      this.editOrder(this.orderID, updatedOrder);
      redirect_url = '/cart';
    } else {
      // let updatedCoupon = this.couponValue;
      // updatedCoupon.isUsed = true;
      this.pointService.addPoints(this.finalAmount);
      localStorage.removeItem('orderIDLS');
      let updatedOrder = this.singleOrderData;
      updatedOrder.status = 'Success';
      this.editOrder(this.orderID, updatedOrder)
      // this.editCoupon(this.couponValue.id, updatedCoupon);
      redirect_url = `/placed/${this.orderID}`;
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
      image: 'https://img.logoipsum.com/245.svg',
      prefill: {
        name: 'Snehal',
        email: 'snehal@gmail.com',
        phone: '9898989898',
      },
      theme: {
        color: '#001524',
      },
      modal: {
        ondismiss: () => {
          console.log('dismissed');
        },
      },
    };

    const successCallback = (paymentid: any) => {
      let updatedOrder = this.singleOrderData;
      updatedOrder.status = 'Success';
      this.editOrder(this.orderID, updatedOrder);
      console.log(paymentid);
      this.router.navigate(['/']);
    };

    const failureCallback = (e: any) => {
      let updatedOrder = this.singleOrderData;
      updatedOrder.status = 'Failed';
      this.editOrder(this.orderID, updatedOrder);
      console.log(e);
    };

    Razorpay.open(RazorpayOptions, successCallback, failureCallback);
  }

  addOrder(summary: any) {
    const uid = new ShortUniqueId({
      dictionary: 'alphanum_upper',
      length: 11,
    });
    this.newCartObject = {
      cart: this.cart,
      summary: summary,
      id: `ORD` + uid.rnd(),
    };
    // this.orderID = this.newCartObject.id;
    this.orderService.addOrder(this.newCartObject).then((result) => {
      if (result) {
        this.authService.updateCheckoutStatus(true);
        this.router.navigate(['/checkout', this.newCartObject.id]);
        localStorage.setItem('orderIDLS', this.newCartObject.id);
      } else {
        console.log('error in adding order');
      }
    });
  }

  editOrder(id: string, item: any) {
    this.orderService.updateorder(id, item).then((result) => {
      if (result) {
        this.authService.updateCheckoutStatus(true);
        this.router.navigate(['/checkout', id]);
        console.log('order edited');
      } else {
        console.log('error in order edition');
      }
    });
  }

  getSingleOrder(id: any) {
    this.apiService.getSingleOrder(id).subscribe(
      (data) => {
        this.singleOrderData = data;
        this.totalAmount = this.singleOrderData.summary.subtotal;
        this.finalAmount = this.singleOrderData.summary.finalAmount;
        this.deliveryAmount = this.singleOrderData.summary.shipping;
        this.couponValue.code = this.singleOrderData.summary.couponCode;
        this.redeemDiscount = this.singleOrderData.summary.couponsDiscount;
        this.discountPoints = this.singleOrderData.summary.isChecked
          ? this.singleOrderData.summary.redeemPoints
          : 0;
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  cartTotal(): number {
    let total = this.productTotal() + this.giftTotal();
    return total;
  }

  productTotal(): number {
    let total = 0;
    for (const item of this.cart) {
      if (!item.isGiftCard) total += item.price * item.qty;
    }
    return total;
  }

  giftTotal(): number {
    let total = 0;
    for (const item of this.cart) {
      if (item.isGiftCard) total += item.price * item.qty;
    }
    return total;
  }

  finalTotal(
    deliveryPoints: number,
    redeemPoints?: number,
    couponPoints?: number
  ): number {
    return Math.ceil(
      this.totalAmount +
        deliveryPoints -
        (redeemPoints || 0) -
        (couponPoints || 0)
    );
  }
}
