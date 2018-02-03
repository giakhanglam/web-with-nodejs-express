// ensure that a link to the yet-to-be-created Contact page always exists on the About page
suite('"About" Page Tests', function(){
	test('page should contain link to contact page', function(){
		assert($('a[href="/contact"]').length);
	});
});
