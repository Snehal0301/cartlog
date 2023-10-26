import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3004';
  private featureUrl = `${this.baseUrl}/featured`;
  private latestUrl = `${this.baseUrl}/latest`;
  private watchUrl = `${this.baseUrl}/watches`;
  private mensUrl = `${this.baseUrl}/mens`;
  private womensUrl = `${this.baseUrl}/womens`;
  private wishlistUrl = `${this.baseUrl}/wishlist`;
  private cartUrl = `${this.baseUrl}/cart`;
  private orderUrl = `${this.baseUrl}/orders`;
  private addressUrl = `${this.baseUrl}/address`;

  constructor(private http: HttpClient) {}

  getFeaturedData(): Observable<any> {
    const url = this.featureUrl;
    return this.http.get(url);
  }

  getLatestData(): Observable<any> {
    const url = this.latestUrl;
    return this.http.get(url);
  }

  getWatchData(): Observable<any> {
    const url = this.watchUrl;
    return this.http.get(url);
  }

  getSingleMensProduct(id: string): Observable<any> {
    const url = this.mensUrl + '/' + id;
    return this.http.get(url);
  }

  getMensProduct(
    page?: number,
    sort?: string,
    order?: string
  ): Observable<any> {
    let url = '';
    if (sort || order) {
      url = this.mensUrl + '?_sort=' + sort + '&_order=' + order;
    } else if (page) {
      url = this.mensUrl + '?_page=' + page + '&_limit=5';
    } else {
      url = this.mensUrl;
    }
    return this.http.get(url);
  }

  updateMensProduct(id: string, updateData: any): Observable<any> {
    let url = this.mensUrl + '/' + id;
    return this.http.patch(url, updateData);
  }

  getWomensProduct(
    page?: number,
    sort?: string,
    order?: string
  ): Observable<any> {
    let url = '';
    if (sort || order) {
      url = this.womensUrl + '?_sort=' + sort + '&_order=' + order;
    } else if (page) {
      url = this.womensUrl + '?_page=' + page + '&_limit=5';
    } else {
      url = this.womensUrl;
    }
    return this.http.get(url);
  }

  getSingleWomensProduct(id: string): Observable<any> {
    const url = this.womensUrl + '/' + id;
    return this.http.get(url);
  }

  updateWomensProduct(id: string, updateData: any): Observable<any> {
    let url = this.womensUrl + '/' + id;
    return this.http.patch(url, updateData);
  }

  postWishlist(item: any): Observable<any> {
    return this.http.post(this.wishlistUrl, item);
  }

  getWishlist(): Observable<any> {
    return this.http.get(this.wishlistUrl);
  }

  deleteWishlist(id: any): Observable<any> {
    let url = this.wishlistUrl + `/${id}`;
    return this.http.delete(url, { observe: 'response' });
  }

  updateWishlist(id: string, updateData: any): Observable<any> {
    let url = this.wishlistUrl + '/' + id;
    return this.http.patch(url, updateData);
  }

  postCart(item: any): Observable<any> {
    return this.http.post(this.cartUrl, item);
  }

  getCart(): Observable<any> {
    return this.http.get(this.cartUrl);
  }

  deleteCart(id: any): Observable<any> {
    let url = this.cartUrl + `/${id}`;
    return this.http.delete(url, { observe: 'response' });
  }
  deleteMulti(): Observable<any> {
    let url = this.cartUrl + `?id=107367bc76f2e&id=332f801566d86`;
    return this.http.delete(url, { observe: 'response' });
  }

  updateCart(id: string, updateData: any): Observable<any> {
    let url = this.cartUrl + '/' + id;
    return this.http.patch(url, updateData);
  }

  filterProducts(category: string, params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/${category}`, { params });
  }
  
  addOrder(data: any): Observable<any> {
    return this.http.post(this.orderUrl, data);
  }
  getOrder():Observable<any>{
    return this.http.get(this.orderUrl);
  }

  getAddress():Observable<any>{
    return this.http.get(this.addressUrl);
  }
  addAddress(data:any):Observable<any>{
    return this.http.post(this.addressUrl, data);
  }

  deleteAddress(id:any): Observable<any>{
    let url = this.addressUrl + `/${id}`;
    return this.http.delete(url, { observe: 'response' });
  }

  updateAddress(id: string, updateData: any): Observable<any> {
    let url = this.addressUrl + '/' + id;
    return this.http.patch(url, updateData);
  }

}
