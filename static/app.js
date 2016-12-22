var cal = new CalHeatMap();
var startDate = new Date();
var clickDate = null;
startDate.setMonth(startDate.getMonth() - 11, 1);

cal.init({
  data: "/api/heatmap",
  domain: "month",
  start: startDate,
  domainGutter: 10,
  range: 12,
  legend: [1, 3, 5, 10, 20],
  onClick: function(date, nb) {
    
    if (clickDate !== null && clickDate.toDateString() == date.toDateString()) {
      clickDate = null;
    } else {
      clickDate = date;
    }
    
    vue.filterDate(clickDate);
    
  }
});

// Set moment locale
moment.locale(navigator.language || navigator.userLanguage);

// infinite scroll
var scrollTimeout = 0;
function moreInViewport() {
  
  var el = document.querySelector('.timeline-more'),
    top	= el.offsetTop,
	  tmp = el;
	
	while (tmp.offsetParent) {
		
		tmp = tmp.offsetParent;
		top += tmp.offsetTop;
		
	}
	
	var windowInnerHeight = window.innerHeight;
	
	return (
		top < (window.pageYOffset + windowInnerHeight)
	);
	
}

window.onscroll = function() {
  
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
    scrollTimeout = 0;
  }
  
  scrollTimeout = setTimeout(function() {
    if (moreInViewport()) {
      vue.showMore();
    }
  }, 30);
  
};

// Vue
var apiURL = '/api';

var vue = new Vue({

  el: '#timeline',

  data: {
    data: [],
    deliveries: [],
    deliveriesLimit: 10,
    deliveriesStep: 10,
    softwares: [],
    environments: [],
    currentSoft: "",
    currentEnv: "",
    colors: [
      '#2ecc71',
      '#5bc0de',
      '#3498db'
    ]
  },

  created: function () {
    this.fetchData();
  },

  watch: {
    //currentBranch: 'fetchData'
  },

  filters: {
    truncate: function (v) {
      var newline = v.indexOf('\n');
      return newline > 0 ? v.slice(0, newline) : v;
    },
    formatDate: function (v) {
      return moment(v).format('LLLL');
    },
    getChangelogURL: function(v) {
      if(v.repository.length === 0) return;
      return `https://${v.repository}/src/HEAD/CHANGELOG.md?at=master`;
    }
  },

  methods: {
    populateDeliveries: function(data) {
      
      this.deliveries = [];
      
      if (data.length) {
        for (var i in data) {
          if (
              (this.currentSoft === "" || data[i].software == this.currentSoft) &&
              (this.currentEnv === "" || data[i].environment == this.currentEnv)
            ) {
            this.deliveries.push(data[i]);
          }
        }
      }
      
    },
    filter: function(name){
      
      this.deliveries = [];
      
      if (this.currentSoft == name){
        this.currentSoft = "";
      } else {
        this.currentSoft = name;
      }
      
      this.populateDeliveries(this.data);
      
    },
    filterEnv: function(name){
      
      this.deliveries = [];
      
      if (this.currentEnv == name){
        this.currentEnv = "";
      } else {
        this.currentEnv = name;
      }
      
      this.populateDeliveries(this.data);
      
    },
    filterDate: function(date){
      
      if (date === null) {
        this.populateDeliveries(this.data);
        return;
      }
      
      date = date.toDateString();
      var data = [];
      for (var i in this.data) {
        if ((new Date(this.data[i].date)).toDateString() == date) {
          data.push(this.data[i]);
        }
      }
      
      this.populateDeliveries(data);
      
    },
    fetchData: function () {
      var xhr = new XMLHttpRequest();
      var self = this;
      xhr.open('GET', apiURL + "/deliveries");
      xhr.onload = function () {
        d = JSON.parse(xhr.responseText);
        self.data = d;
        var index, i;
        
        for (i = 0; i < d.length ; i++) {
          
          index = self.softwares.indexOf(d[i].software);
          if (index === -1) {
            self.softwares.push(d[i].software);
            index = self.softwares.length-1;
          }
          
          index = self.environments.indexOf(d[i].environment);
          if (index === -1) {
            self.environments.push(d[i].environment);
            index = self.environments.length-1;
          }
          
        }
        
        self.softwares.sort();
        self.environments.sort();
        
        for (i in self.data) {
          
          index = self.environments.indexOf(self.data[i].environment);
          self.data[i].environmentColor = self.colors[index];
          
        }
        
        self.populateDeliveries(self.data);
      };
      xhr.send();
    },
    showMore: function() {
      
      this.deliveriesLimit+= this.deliveriesStep;
      
    }
  }
});