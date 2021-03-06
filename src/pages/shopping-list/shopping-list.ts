import { Component } from '@angular/core';
import {Ingredient} from "../../models/ingradient";
import {ShoppingListService} from "../../services/shopping-list-service";
import {ModelValidationService} from "../../services/model-validation-service";
import {ToastWrapper} from "../../utils/toast-wrp";
import {Events} from "ionic-angular";
import {BackupPage} from "../backup/backup";


@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html'
})
export class ShoppingListPage {

  /**
   * In UI makes the editing form
   * visible/invisible
   * @type {boolean}
   * @private
   */
  private _displayForm:boolean = false;

  /**
   * View model object to host data
   * from the ingredient editing
   * form on this page.
   */
  private _ingredient:Ingredient;

  /**
   * View model object to host
   * the list of ingredients
   * presented in a list on this
   * page.
   * @type {Array}
   * @private
   */
  private _ingredients:Ingredient[]=[];

  constructor(
    private _shoppingListSrv:ShoppingListService,
    private _validatorSrv:ModelValidationService,
    private _toastWrp:ToastWrapper,
    private _events:Events)
  {
    //by default binds to a new empty ingredient,
    //so the user can just start creating new
    //ingredients easily
    this._ingredient = this._shoppingListSrv.getNewIngredient();

    //after restoring the ingredients backup (BackupPage)
    //an event is fired to inform this page that is again
    //on root view and it has to perform a data loading
    //to update the list of ingredients that normally is
    //loaded only on viewWillEnter
    this._events.subscribe(BackupPage.SHOPPINGLIST_RESTORED_EVENT,()=>{
      this._loadIngredients();
    });
  }

  /**
   * Performs loading of ingredients
   * data needed to show the list
   * on the page.
   */
  ionViewWillEnter(){
    this._loadIngredients();
  }

  /**
   * Performs loading of ingredients
   * by getting data from the ShoppingList
   * Service.
   */
  private _loadIngredients(){
    let self = this;
    this._shoppingListSrv.getIngredients((list,err)=>{
      if(!err) self._ingredients = list;
      else self._toastWrp.warn(err.message);
    });
  }

  /**
   * Add a new ingredient to the list
   * when valid, or shows validation
   * messages to the user.
   * Then binds the form to a new
   * empty ingredient instance.
   * @private
   */
  private _addIngredient(){
    let self = this;

    //forces the cast to number, for some reason the input form
    //returns "amount" as string, even if the model field is
    //type number and the <input> type is number too.
    this._ingredient.amount = parseInt(this._ingredient.amount.toString());

    this._validatorSrv.whenValid(this._ingredient, ()=>{
        this._shoppingListSrv.addIngredient(this._ingredient,this._ingredients,(err)=>{
          if(err) return self._toastWrp.warn(err.message);

          //binds the form to a new empty ingredient
          //to edit a new one
          self._ingredient = this._shoppingListSrv.getNewIngredient();
          self._toastWrp.info('New ingredient in the list', ToastWrapper.LENGTH_SHORT);
        });
      },
      err=>{});/* validation messages already displayed on UI */
  }

  /**
   * Remove the selected ingredient from
   * the list and reloads it on UI.
   * @param ingredient
   * @private
   */
  private _removeIngredient(ingredient:Ingredient){
    let self = this;
    this._shoppingListSrv.removeIngredient(ingredient,this._ingredients,(err)=>{
      if(err) self._toastWrp.warn(err.message);
    });
  }


}
