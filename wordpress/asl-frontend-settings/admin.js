jQuery(document).ready(function($) {
    // Media Library Upload
    $(document).on('click', '.asl-upload-btn', function(e) {
        e.preventDefault();
        var btn = $(this);
        var target = $(btn.data('target'));
        var preview = $(btn.data('preview'));
        var removeBtn = btn.siblings('.asl-remove-btn');
        
        var frame = wp.media({
            title: 'Select Image',
            button: { text: 'Use Image' },
            multiple: false
        });
        
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            target.val(attachment.url);
            preview.html('<img src="' + attachment.url + '" style="max-width:300px;max-height:150px;display:block;margin-top:10px;">');
            removeBtn.show();
        });
        
        frame.open();
    });
    
    // Remove Image
    $(document).on('click', '.asl-remove-btn', function(e) {
        e.preventDefault();
        var btn = $(this);
        var target = $(btn.data('target'));
        var preview = $(btn.data('preview'));
        target.val('');
        preview.html('');
        btn.hide();
    });

    // Logo Upload (stores attachment ID)
    $(document).on('click', '.asl-logo-upload-btn', function(e) {
        e.preventDefault();
        var btn = $(this);
        var targetId = $(btn.data('target-id'));
        var targetUrl = $(btn.data('target-url'));
        var preview = $(btn.data('preview'));
        var removeBtn = btn.siblings('.asl-logo-remove-btn');

        var frame = wp.media({
            title: 'Select Logo',
            button: { text: 'Use as Logo' },
            multiple: false
        });

        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            targetId.val(attachment.id);
            targetUrl.val(attachment.url);
            preview.html('<img src="' + attachment.url + '" style="max-width:300px;max-height:150px;display:block;margin-top:10px;">');
            removeBtn.show();
        });

        frame.open();
    });

    // Logo Remove
    $(document).on('click', '.asl-logo-remove-btn', function(e) {
        e.preventDefault();
        var btn = $(this);
        var targetId = $(btn.data('target-id'));
        var targetUrl = $(btn.data('target-url'));
        var preview = $(btn.data('preview'));
        targetId.val('0');
        targetUrl.val('');
        preview.html('');
        btn.hide();
    });
    
    // Add Hero Slide
    $('#asl-add-slide').on('click', function() {
        var container = $('#asl-hero-slides');
        var count = container.find('.asl-slide-item').length;
        var html = '<div class="asl-slide-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">' +
            '<h4>Slide ' + (count + 1) + ' <button type="button" class="button asl-remove-slide" style="float:right;color:red;">Remove</button></h4>' +
            '<table class="form-table">' +
            '<tr><th>Desktop Image</th><td><div class="asl-image-field">' +
            '<input type="hidden" name="asl_hero_slides[' + count + '][image]" id="asl_hero_slides_' + count + '_image" value="">' +
            '<button type="button" class="button asl-upload-btn" data-target="#asl_hero_slides_' + count + '_image" data-preview="#asl_hero_slides_' + count + '_image_preview">Upload Image</button>' +
            '<button type="button" class="button asl-remove-btn" data-target="#asl_hero_slides_' + count + '_image" data-preview="#asl_hero_slides_' + count + '_image_preview" style="display:none;">Remove</button>' +
            '<div id="asl_hero_slides_' + count + '_image_preview" class="asl-preview"></div></div></td></tr>' +
            '<tr><th>Mobile Image</th><td><div class="asl-image-field">' +
            '<input type="hidden" name="asl_hero_slides[' + count + '][mobile]" id="asl_hero_slides_' + count + '_mobile" value="">' +
            '<button type="button" class="button asl-upload-btn" data-target="#asl_hero_slides_' + count + '_mobile" data-preview="#asl_hero_slides_' + count + '_mobile_preview">Upload Image</button>' +
            '<button type="button" class="button asl-remove-btn" data-target="#asl_hero_slides_' + count + '_mobile" data-preview="#asl_hero_slides_' + count + '_mobile_preview" style="display:none;">Remove</button>' +
            '<div id="asl_hero_slides_' + count + '_mobile_preview" class="asl-preview"></div></div></td></tr>' +
            '<tr><th>Link URL</th><td><input type="url" name="asl_hero_slides[' + count + '][link]" value="" class="large-text"></td></tr>' +
            '</table></div>';
        container.append(html);
    });
    
    // Remove Hero Slide
    $(document).on('click', '.asl-remove-slide', function() {
        $(this).closest('.asl-slide-item').remove();
        reindexSlides();
    });
    
    function reindexSlides() {
        $('#asl-hero-slides .asl-slide-item').each(function(i) {
            $(this).find('h4').contents().first().replaceWith('Slide ' + (i + 1) + ' ');
            $(this).find('input[name^="asl_hero_slides"]').each(function() {
                var name = $(this).attr('name').replace(/\[\d+\]/, '[' + i + ']');
                var id = $(this).attr('id').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('name', name).attr('id', id);
            });
            $(this).find('.asl-upload-btn, .asl-remove-btn').each(function() {
                var target = $(this).data('target').replace(/_\d+_/, '_' + i + '_');
                var preview = $(this).data('preview').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('data-target', target).attr('data-preview', preview);
            });
            $(this).find('.asl-preview').each(function() {
                var id = $(this).attr('id').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('id', id);
            });
        });
    }
    
    // Add Collection
    $('#asl-add-collection').on('click', function() {
        var container = $('#asl-collections-items');
        var count = container.find('.asl-collection-item').length;
        var html = '<div class="asl-collection-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">' +
            '<h4>Collection ' + (count + 1) + ' <button type="button" class="button asl-remove-collection" style="float:right;color:red;">Remove</button></h4>' +
            '<table class="form-table">' +
            '<tr><th>Image</th><td><div class="asl-image-field">' +
            '<input type="hidden" name="asl_collections_items[' + count + '][image]" id="asl_collections_items_' + count + '_image" value="">' +
            '<button type="button" class="button asl-upload-btn" data-target="#asl_collections_items_' + count + '_image" data-preview="#asl_collections_items_' + count + '_image_preview">Upload Image</button>' +
            '<button type="button" class="button asl-remove-btn" data-target="#asl_collections_items_' + count + '_image" data-preview="#asl_collections_items_' + count + '_image_preview" style="display:none;">Remove</button>' +
            '<div id="asl_collections_items_' + count + '_image_preview" class="asl-preview"></div></div></td></tr>' +
            '<tr><th>Title (EN)</th><td><input type="text" name="asl_collections_items[' + count + '][title]" value="" class="regular-text"></td></tr>' +
            '<tr><th>Title (AR)</th><td><input type="text" name="asl_collections_items[' + count + '][title_ar]" value="" class="regular-text" dir="rtl"></td></tr>' +
            '<tr><th>Description (EN)</th><td><textarea name="asl_collections_items[' + count + '][description]" class="large-text" rows="2"></textarea></td></tr>' +
            '<tr><th>Description (AR)</th><td><textarea name="asl_collections_items[' + count + '][description_ar]" class="large-text" rows="2" dir="rtl"></textarea></td></tr>' +
            '<tr><th>Link</th><td><input type="url" name="asl_collections_items[' + count + '][link]" value="" class="large-text"></td></tr>' +
            '</table></div>';
        container.append(html);
    });
    
    // Remove Collection
    $(document).on('click', '.asl-remove-collection', function() {
        $(this).closest('.asl-collection-item').remove();
        reindexCollections();
    });
    
    function reindexCollections() {
        $('#asl-collections-items .asl-collection-item').each(function(i) {
            $(this).find('h4').contents().first().replaceWith('Collection ' + (i + 1) + ' ');
            $(this).find('input[name^="asl_collections_items"], textarea[name^="asl_collections_items"]').each(function() {
                var name = $(this).attr('name').replace(/\[\d+\]/, '[' + i + ']');
                var id = $(this).attr('id') ? $(this).attr('id').replace(/_\d+_/, '_' + i + '_') : '';
                $(this).attr('name', name);
                if (id) $(this).attr('id', id);
            });
            $(this).find('.asl-upload-btn, .asl-remove-btn').each(function() {
                var target = $(this).data('target').replace(/_\d+_/, '_' + i + '_');
                var preview = $(this).data('preview').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('data-target', target).attr('data-preview', preview);
            });
            $(this).find('.asl-preview').each(function() {
                var id = $(this).attr('id').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('id', id);
            });
        });
    }
    
    // Add Banner
    $('#asl-add-banner').on('click', function() {
        var container = $('#asl-banners-items');
        var count = container.find('.asl-banner-item').length;
        var html = '<div class="asl-banner-item" style="background:#f9f9f9;padding:15px;margin-bottom:15px;border:1px solid #ddd;">' +
            '<h4>Banner ' + (count + 1) + ' <button type="button" class="button asl-remove-banner" style="float:right;color:red;">Remove</button></h4>' +
            '<table class="form-table">' +
            '<tr><th>Desktop Image</th><td><div class="asl-image-field">' +
            '<input type="hidden" name="asl_banners_items[' + count + '][image]" id="asl_banners_items_' + count + '_image" value="">' +
            '<button type="button" class="button asl-upload-btn" data-target="#asl_banners_items_' + count + '_image" data-preview="#asl_banners_items_' + count + '_image_preview">Upload Image</button>' +
            '<button type="button" class="button asl-remove-btn" data-target="#asl_banners_items_' + count + '_image" data-preview="#asl_banners_items_' + count + '_image_preview" style="display:none;">Remove</button>' +
            '<div id="asl_banners_items_' + count + '_image_preview" class="asl-preview"></div></div></td></tr>' +
            '<tr><th>Mobile Image</th><td><div class="asl-image-field">' +
            '<input type="hidden" name="asl_banners_items[' + count + '][mobile]" id="asl_banners_items_' + count + '_mobile" value="">' +
            '<button type="button" class="button asl-upload-btn" data-target="#asl_banners_items_' + count + '_mobile" data-preview="#asl_banners_items_' + count + '_mobile_preview">Upload Image</button>' +
            '<button type="button" class="button asl-remove-btn" data-target="#asl_banners_items_' + count + '_mobile" data-preview="#asl_banners_items_' + count + '_mobile_preview" style="display:none;">Remove</button>' +
            '<div id="asl_banners_items_' + count + '_mobile_preview" class="asl-preview"></div></div></td></tr>' +
            '<tr><th>Title (EN)</th><td><input type="text" name="asl_banners_items[' + count + '][title]" value="" class="regular-text"></td></tr>' +
            '<tr><th>Title (AR)</th><td><input type="text" name="asl_banners_items[' + count + '][title_ar]" value="" class="regular-text" dir="rtl"></td></tr>' +
            '<tr><th>Subtitle (EN)</th><td><input type="text" name="asl_banners_items[' + count + '][subtitle]" value="" class="regular-text"></td></tr>' +
            '<tr><th>Subtitle (AR)</th><td><input type="text" name="asl_banners_items[' + count + '][subtitle_ar]" value="" class="regular-text" dir="rtl"></td></tr>' +
            '<tr><th>Link</th><td><input type="url" name="asl_banners_items[' + count + '][link]" value="" class="large-text"></td></tr>' +
            '</table></div>';
        container.append(html);
    });
    
    // Remove Banner
    $(document).on('click', '.asl-remove-banner', function() {
        $(this).closest('.asl-banner-item').remove();
        reindexBanners();
    });
    
    function reindexBanners() {
        $('#asl-banners-items .asl-banner-item').each(function(i) {
            $(this).find('h4').contents().first().replaceWith('Banner ' + (i + 1) + ' ');
            $(this).find('input[name^="asl_banners_items"], textarea[name^="asl_banners_items"]').each(function() {
                var name = $(this).attr('name').replace(/\[\d+\]/, '[' + i + ']');
                var id = $(this).attr('id') ? $(this).attr('id').replace(/_\d+_/, '_' + i + '_') : '';
                $(this).attr('name', name);
                if (id) $(this).attr('id', id);
            });
            $(this).find('.asl-upload-btn, .asl-remove-btn').each(function() {
                var target = $(this).data('target').replace(/_\d+_/, '_' + i + '_');
                var preview = $(this).data('preview').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('data-target', target).attr('data-preview', preview);
            });
            $(this).find('.asl-preview').each(function() {
                var id = $(this).attr('id').replace(/_\d+_/, '_' + i + '_');
                $(this).attr('id', id);
            });
        });
    }
});
