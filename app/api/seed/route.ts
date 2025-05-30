import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// For debugging purposes - directly access supabase URL and key to debug
import { createClient as createDirectClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createDirectClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Get server-side supabase client 
    const supabase = await createClient();
    
    // Check database structure
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return NextResponse.json({ 
        error: "Unable to query database structure", 
        details: tablesError 
      }, { status: 500 });
    }
    
    // Check dream_entries table columns
    const { data: dreamEntryColumns, error: columnsError } = await supabaseAdmin
      .rpc('get_column_info', { table_name: 'dream_entries' });
      
    if (columnsError) {
      console.error("Error checking dream_entries columns:", columnsError);
    }
    
    // 🌟 Create a Dummy User (You must manually create this user in Supabase Auth)
    const user_id = '550e8400-e29b-41d4-a716-446655440000'; // Replace with an actual Supabase Auth user ID

    // 🌟 Insert Profile
    await supabase.from('profile').insert([
      { user_id, language: 'English', bible_version: 'KJV' },
    ]);

    // 🌟 Insert Dream Entry
    const { data: dreamEntry, error: dreamError } = await supabase
      .from('dream_entries')
      .insert([
        {
          user_id,
          original_text: 'I was flying above the city, but then fell into water.',
          title: 'Flying and Falling',
          dream_summary: 'A dream about gaining freedom and losing control.',
          analysis_summary: 'This dream signifies a struggle between ambition and self-doubt.',
          topic_sentence: 'Sometimes, our greatest aspirations carry the risk of failure.',
          gematria_interpretation:
            'Flying represents high spiritual or personal ambitions, while falling suggests fear of losing control.',
          color_symbolism:
            'Water is often linked to emotions—falling into water could mean deep emotional challenges.',
          image_url:
            'https://your-supabase-url.com/storage/v1/object/public/dream-images/flying-dream.jpg',
          tags: ['flying', 'water', 'falling', 'freedom', 'control'],
          bible_refs: ['Isaiah 40:31', 'Proverbs 24:16']
        },
      ])
      .select()
      .single();

    if (dreamError) throw dreamError;

    // 🌟 Insert Bible Citations for the Dream Entry
    await supabase.from('bible_citations').insert([
      {
        dream_entry_id: dreamEntry.id,
        bible_book: 'Isaiah',
        chapter: 40,
        verse: 31,
        full_text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles...',
        citation_order: 1,
      },
      {
        dream_entry_id: dreamEntry.id,
        bible_book: 'Proverbs',
        chapter: 24,
        verse: 16,
        full_text: 'For though the righteous fall seven times, they rise again...',
        citation_order: 2,
      },
    ]);

    // 🌟 (Optional) Insert a Subscription Record
    await supabase.from('subscriptions').insert([
      {
        user_id,
        stripe_subscription_id: 'sub_abc123xyz',
        status: 'active',
        plan: 'premium',
        credits: 100,
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    ]);

    // 🌟 (Optional) Insert a Payment Record
    await supabase.from('payments').insert([
      {
        user_id,
        stripe_payment_id: 'pi_1234567890',
        amount: 9.99,
        currency: 'USD',
        status: 'succeeded',
      },
    ]);

    // Try to create a test dream entry directly
    const { data: testDreamDirect, error: testDreamDirectError } = await supabaseAdmin
      .from('dream_entries')
      .insert({
        user_id,
        original_text: 'Test dream via admin client for debugging',
        title: 'Debug Test',
        tags: ['test', 'debug'],
        bible_refs: ['Genesis 1:1']
      })
      .select()
      .single();
      
    if (testDreamDirectError) {
      console.error("Error with direct test insert:", testDreamDirectError);
    }
    
    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      tables: tables,
      dreamEntryColumns: dreamEntryColumns,
      testDreamDirect: testDreamDirect,
      testDreamDirectError: testDreamDirectError
    }, { status: 200 });
  } catch (error: any) {
    console.error('Seeding error:', error.message);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}