//This improves upon v4 by placing the currentCat in the model, where it belongs, 
//rather than in the controller, so that the app is compliant with the MVC design patter

document.onload=(function () {
	var model = {
		adminMode: false,
		currentCat: null,
		cats:[{name:"Max", src:"../img/max.jpg", clickCount:0}, 
			   {name: "Sam", src:"../img/sam.jpeg", clickCount: 0},
			   {name: "Cheddar", src:"../img/cheddar.jpg", clickCount:0},
			   {name: "Silky", src:"../img/silky.jpg", clickCount:0},
			   {name: "Junior", src:"../img/junior.jpg", clickCount:0}],
			   
		init: function(){
			var currentModel;
			var cached = localStorage.getItem("catClicker");
			if (cached)
				currentModel = JSON.parse(cached);
			else
				currentModel = model;
			currentModel.currentCat = currentModel.cats[0];
			localStorage.setItem("catClicker", JSON.stringify(currentModel));
			}
		};
			
	
	var controller = {
		increment: function(event,cat, admin, catArray){
			for (var i = 0; i < catArray.length; i ++){
				if (catArray[i].name == event.target.getAttribute("name")){
					catArray[i].clickCount += 1;
					cat = catArray[i];
				}
			}
			localStorage.setItem("catClicker", JSON.stringify({currentCat:cat, adminMode:admin, cats:catArray}));
			catDisplay.render();
		},
		getCats: function(){
			return JSON.parse(localStorage.getItem("catClicker")).cats;
		},
		getOneCat: function(name){
			return this.getCats().filter(function(cat){
				return cat.name == name;
			})[0];
		},
		getCurrentCat: function(){
			return JSON.parse(localStorage.getItem("catClicker")).currentCat;
		},
		setCurrentCat: function(cat){
			var updatedModel = JSON.parse(localStorage.getItem("catClicker"));
			updatedModel.currentCat = cat;
			localStorage.setItem("catClicker",JSON.stringify(updatedModel));
		},
		
		getAdminMode: function(){
			return JSON.parse(localStorage.getItem("catClicker")).adminMode;
		},
		
		setAdminMode: function(bool){
			if(bool != true)
				bool = false;
			var updatedmodel = JSON.parse(localStorage.getItem("catClicker"));
			updatedmodel.adminMode = bool;
			localStorage.setItem("catClicker", JSON.stringify(updatedmodel));
			adminDisplay.render();
		},
		
		submit: function(cat,admin,cats,name,url,counter){
			for (var i = 0; i < cats.length; i ++){
				if (cats[i].name == cat.name){
					cat.name = name.value;
					cat.url = url.value;
					cat.clickCount = Number(counter.value);
					cats[i] = cat;
				}
			}
			localStorage.setItem("catClicker", JSON.stringify({currentCat:cat, adminMode:admin, cats:cats}));
			catSelector.render();
			catDisplay.render();
			adminDisplay.render();
		},
		
		init: function(){
			model.init();
			catSelector.init();
			catDisplay.init();
			adminDisplay.init();
		}
	};
	
	
	var catSelector = {
		init: function(){
			this.catSelectionMenu = document.querySelector("#catselection");
			this.catSelectionMenu.addEventListener("click", function(event){
				if(event.target.tagName == "IMG"){
					controller.setCurrentCat(controller.getOneCat(event.target.getAttribute("name")));
					catDisplay.render();
					adminDisplay.render();
				}
			});
			this.render();
		},
		
		render: function(){
			var catSelectionMenu = this.catSelectionMenu; //cache vars for use in forEach callback (performance)
			catSelectionMenu.innerHTML = "";
			controller.getCats().forEach(function(cat){
				var template = document.querySelector(".template-cat-selection").innerHTML;
				var instance = template.replace(/\{\{(\w+)\}\}/g, function(_,variable){
					return cat[variable];
				});
				var div = document.createElement("div");
				div.innerHTML = instance;
				catSelectionMenu.appendChild(div);
			});
		}
	};
	
	var catDisplay = {
		init: function(){
			this.displayArea = document.querySelector("#displayarea");
			this.render();
		},
		
		render: function(){
			this.displayArea.innerHTML = "";
			var template = document.querySelector(".template-cat-display").innerHTML;
			var cat = controller.getCurrentCat();
			var catArray = controller.getCats();
			var admin = controller.getAdminMode();
			var instance = template.replace(/\{\{(\w+)\}\}/g, function(_,variable){
					return cat[variable];
				});
			var div = document.createElement("div");
			div.innerHTML = instance;
			div.querySelector("img").addEventListener("click",  function(event){
					controller.increment(event,cat,admin,catArray);
					adminDisplay.render();
			});
			this.displayArea.appendChild(div);
		}
	};	
	
	var adminDisplay = {
		init:function(){
			this.adminArea = document.querySelector("#adminarea");
			this.adminbutton = this.adminArea.querySelector("#admin-button");
			this.admincontrolpanel = this.adminArea.querySelector("#admin-control-panel");
			this.catname = this.adminArea.querySelector("#admin-cat-name");
			this.caturl = this.adminArea.querySelector("#admin-cat-url");
			this.catcounter = this.adminArea.querySelector("#admin-cat-counter");
			this.cancelbutton = this.adminArea.querySelector("#admin-cancel");
			this.savebutton = this.adminArea.querySelector("#admin-save");
			this.adminbutton.addEventListener("click", function(){
					controller.setAdminMode(true);
				});
			this.cancelbutton.addEventListener("click", function(event){
					event.preventDefault();
					controller.setAdminMode(false);
				});
			this.render();
		},
		render:function(){
			var admin = controller.getAdminMode();
			if(admin){
				var cat = controller.getCurrentCat();
				var cats = controller.getCats();
				this.catname.value = cat.name;
				this.caturl.value = cat.src;
				this.catcounter.value = cat.clickCount;
				this.admincontrolpanel.style.display = "initial";
				var oldsavebutton = this.savebutton;
				this.savebutton = oldsavebutton.cloneNode(true);
				oldsavebutton.parentNode.replaceChild(this.savebutton, oldsavebutton);
				this.savebutton.addEventListener("click", function(event){
						event.preventDefault();
						controller.submit(cat,admin,cats,adminDisplay.catname,adminDisplay.caturl,adminDisplay.catcounter);
						}
				);
			}else{
				this.admincontrolpanel.style.display = "none";
			}
		}
	};
	
	controller.init();
})();