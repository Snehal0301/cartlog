import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { CommonService } from 'src/service/common.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private commonService: CommonService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isCheckout = this.commonService.getCheckoutStatus();

    if (isCheckout) {
      return true;
    } else {
      this.router.navigate(['/']); // Redirect to the home page
      return false;
    }
  }
}
