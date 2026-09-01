(function() {
    'use strict';

    window.GeoManager = {
        sync: function(active) {
            try {
                if (active) {
                    var realRaw = localStorage.getItem('geo');
                    var overrideRaw = localStorage.getItem('geo_override');
                    if (!realRaw || !overrideRaw) return false;

                    var real = JSON.parse(realRaw);
                    var override = JSON.parse(overrideRaw);

                    var mixed = {
                        lat:  real.lat,
                        lon:  real.lon,
                        code: override.code,
                        flag: override.flag
                    };

                    localStorage.setItem('geo_override', JSON.stringify(mixed));
                    localStorage.setItem('geo_bypass_tick', 'true');
                } else {
                    localStorage.setItem('geo_bypass_tick', 'false');
                }

                window.location.reload();
                return true;
            } catch(e) {
                return false;
            }
        },

        isActive: function() {
            return localStorage.getItem('geo_bypass_tick') === 'true';
        }
    };
})();