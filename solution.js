

let a = {
  /**

   *
   * @param  {Elevator} elevators
   * @param floors
   */
  init: (elevators, floors) => {
    var elevator = elevators[0]; // Let's use the first elevator
    let set = new Set()
    elevators.map((elevator,index) => {
      elevator.index = index;
      elevator.up = true;
      elevator.on('stopped_at_floor', (floor) => {
       let  currentLoad = elevator.loadFactor();
        if (elevator.lastLoadFactor == currentLoad) {
          elevator.full = true;
          console.log('满了 下次不停')
        }else{
          console.log('没满', currentLoad, elevator.lastLoadFactor);
          elevator.full = false;
        }
        elevator.lastStop = floor;
        elevator.lastLoadFactor = currentLoad;
      })
    })
    this.time = 0
  },

  update: (dt, elevators, floors) => {
    function max(arr) {
      return Math.max.apply(null, arr);
    }

    function min(arr) {
      return Math.min.apply(null, arr);
    }

    this.time += dt

    function setIsUp(elevator, up) {
      //    elevator.goingDownIndicator(!up);
      //  elevator.goingUpIndicator(up);

    }

    let upPressed = new Set()
    let downPressed = new Set()
    floors.map(floor => {
      let floor_num = floor.floorNum();
      if (floor.buttonStates.up) {
        upPressed.add(floor_num);
      }
      if (floor.buttonStates.down) {
        downPressed.add(floor_num);
      }
    });


    const eachElevator = (elevator, index) => {

      const getDistQueue = (up) => {
        let currentFloor = elevator.currentFloor()

        let destinationQueue = [];
        let pressed = elevator.getPressedFloors().filter((item) => {
          if (up) {
            return item >= currentFloor
          } else {
            return item <= currentFloor;
          }
        });

        Array.prototype.push.apply(destinationQueue, pressed)
        floors.map(floor => {
          let floor_num = floor.floorNum();
          if (elevator.loadFactor() > 0.8||elevator.full) {
            return
          }
          if (up && floor_num < currentFloor || !up && floor_num > currentFloor) {
            return;
          }
          if (up) { //先找同方向的
            if (upPressed.has(floor_num) && floor_num != elevator.lastStop) {
              destinationQueue.push(floor_num);
              upPressed.delete(floor_num)
            }
          } else if (!up) {
            if (downPressed.has(floor_num) && floor_num != elevator.lastStop) {
              destinationQueue.push(floor_num);
              downPressed.delete(floor_num);
            }
          }
        });
        if (destinationQueue.length == 0) { //实在找不到找反方向的也行
          floors.map(floor => {
            let floor_num = floor.floorNum();
            if (elevator.loadFactor() > 0.8||elevator.full) {
              return
            }
            if (up && floor_num < currentFloor || !up && floor_num > currentFloor) {
              return;
            }
            if (up) {
              if (downPressed.has(floor_num) && floor_num != elevator.lastStop) {
                destinationQueue.push(floor_num);
                downPressed.delete(floor_num)

              }
            } else if (!up) {
              if (upPressed.has(floor_num) && floor_num != elevator.lastStop) {
                destinationQueue.push(floor_num);
                upPressed.delete(floor_num);
              }
            }
          });

        }
        let queue = Array.from(new Set(destinationQueue).values()).sort((a, b,) => {
          if (up) {
            return a - b
          } else {
            return b - a
          }
        });
        return queue;
      };


      elevator.destinationQueue = getDistQueue(elevator.up);
      if (elevator.destinationQueue.length) {
        console.log('这个方向还有活')
      } else {
        console.log('这个方向结束了 看看另一个方向')
        let queue = getDistQueue(!elevator.up);
        if (queue.length) {
          elevator.destinationQueue = queue;
          elevator.up = !elevator.up;
          setIsUp(elevator, elevator.up);
          console.log('掉头向' + elevator.up ? '上' : '下');
        } else {
          console.log('失业了')
          //         elevator.stop();
        }
      }
      elevator.checkDestinationQueue();
      console.debug(elevator.up ? '向上' : '向下', elevator.destinationQueue, elevator.getPressedFloors());

    }
    elevators.sort((e1,e2)=>{
      return e1.loadFactor() - e2.loadFactor();
    }).map(eachElevator);
  }

}
