/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import {ElementRef} from 'angular2/angular2';
import * as rpg from '../index';
import {RPGGame} from './services/rpggame';
import {GameTileMap} from '../gameTileMap';


/**
 * Base implementation of a view for a GameTileMap.
 */
export class Map {
  tileMap:GameTileMap = null;
  get mapName():string {
    return this.tileMap ? this.tileMap.name : '';
  }
  set mapName(value:string) {
    this._loadMap(value);
  }

  constructor(public elRef:ElementRef, public game:RPGGame){
    this._canvas = elRef.nativeElement.querySelector('canvas');
    this._context = <CanvasRenderingContext2D>this._canvas.getContext("2d");
  }

  protected _view:pow2.tile.TileMapView = null;

  /**
   * Load a map by name as a [[Promise]].
   * @param value The map name, e.g. "keep" or "isle"
   * @private
   */
  protected _loadMap(value:string):Promise<GameTileMap> {
    return new Promise<GameTileMap>((resolve, reject)=> {
      this.game.loader.load(this.game.world.getMapUrl(value), (map:pow2.TiledTMXResource)=> {
        if (!map || !map.isReady()) {
          return reject('invalid resource: ' + this.game.world.getMapUrl(value));
        }
        if (this.tileMap) {
          this.tileMap.destroy();
          this.tileMap = null;
        }
        this.tileMap = this.game.world.entities.createObject('GameMapObject', {
          resource: map
        });
        this._onMapLoaded(this.tileMap);
        this.game.world.scene.addObject(this.tileMap);
        this.tileMap.loaded();
        this._view.setTileMap(this.tileMap);
        resolve(this.tileMap);
      });
    });
  }

  /**
   * Called when a map has been loaded, and is about to be added to the current scene.
   *
   * This callback is useful for doing map-specific things when the map changes.
   * @private
   */
  protected _onMapLoaded(map:GameTileMap){

  }

  protected _canvas:HTMLCanvasElement = null;
  protected _context:any = null;
  /**
   * The map view bounds in world space.
   */
  protected _bounds:pow2.Point = new pow2.Point();

  protected _onResize() {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
    this._bounds.set(this._canvas.width, this._canvas.height);
    this._bounds = this._view.screenToWorld(this._bounds);
    this._context.webkitImageSmoothingEnabled = false;
    this._context.mozImageSmoothingEnabled = false;
    this._context.imageSmoothingEnabled = false;
  }


}