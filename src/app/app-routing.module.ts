import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotfoundComponent } from './pages/notfound/notfound.component';
import { SingleProductComponent } from './pages/single-product/single-product.component';
import { ProductlistComponent } from './pages/productlist/productlist.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AuthGuard } from './guards/auth.guard';
import { OrderplacedComponent } from './pages/orderplaced/orderplaced.component';
import { GiftcardComponent } from './pages/giftcard/giftcard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'products/:category/:id',
    component: SingleProductComponent,
  },
  {
    path: 'products/:category',
    component: ProductlistComponent,
    pathMatch: 'full',
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        component: ProductlistComponent,
      },
    ],
  },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'cart', component: CartComponent },
  { path: 'giftcard', component: GiftcardComponent },
  { path: 'placed', component: OrderplacedComponent  },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'notFound', component: NotfoundComponent },
  { path: '**', redirectTo: '/notFound' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
