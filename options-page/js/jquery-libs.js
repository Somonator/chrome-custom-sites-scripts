$.fn.serializeObject = function() {
    var data = {};

    function buildInputObject(arr, val) {
        if (arr.length < 1) {
            return val;  
        }
        var objkey = arr[0];
        if (objkey.slice(-1) == "]") {
            objkey = objkey.slice(0,-1);
        }  
        var result = {};
        if (arr.length == 1){
            result[objkey] = val;
        } else {
            arr.shift();
            var nestedVal = buildInputObject(arr,val);
            result[objkey] = nestedVal;
        }
        return result;
    }

    function gatherMultipleValues( that ) {
        var final_array = [];
        $.each(that.serializeArray(), function( key, field ) {
            // Copy normal fields to final array without changes
            if( field.name.indexOf('[]') < 0 ){
                final_array.push( field );
                return true; // That's it, jump to next iteration
            }

            // Remove "[]" from the field name
            var field_name = field.name.split('[]')[0];

            // Add the field value in its array of values
            var has_value = false;
            $.each( final_array, function( final_key, final_field ){
                if( final_field.name === field_name ) {
                    has_value = true;
                    final_array[ final_key ][ 'value' ].push( field.value );
                }
            });
            // If it doesn't exist yet, create the field's array of values
            if( ! has_value ) {
                final_array.push( { 'name': field_name, 'value': [ field.value ] } );
            }
        });
        return final_array;
    }

    // Manage fields allowing multiple values first (they contain "[]" in their name)
    var final_array = gatherMultipleValues( this );

    // Then, create the object
    $.each(final_array, function() {
        var val = this.value;
        var c = this.name.split('[');
        var a = buildInputObject(c, val);
        $.extend(true, data, a);
    });

    return data;
};

$.fn.setFormFieldsData = function(data, repeater_сallback) {
    let form = $(this),
        names = {};

    function convert_to_names(obj, parent_key = '') {
        if (typeof obj !== 'object' || Array.isArray(obj)) {
            names[parent_key] = obj;
            return;
        }
        
        Object.keys(obj).forEach(function(item, i) {
            let key = parent_key === '' ? item : parent_key  + '[' + item + ']';

            convert_to_names(obj[item], key);   
        });
    }
    

    convert_to_names(data);
    
    $.each(names, function(index, element) {
        if (Array.isArray(element)) {
            element.forEach(function(element, i) {
                if (typeof repeater_сallback === 'function') {
                    repeater_сallback(index, element, i);
                }

                form.find('[name="' + index + '[]"]').eq(i).prop('checked', element);
                form.find('[name="' + index + '[]"]').eq(i).val(element); 
            });
        } else {
            form.find('[name="' + index + '"]').prop('checked', element);
            form.find('[name="' + index + '"]').val(element);             
        }
    });

    return form;
};