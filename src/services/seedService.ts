import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { subDays, subMonths, format } from 'date-fns';

export async function seedDemoData(gymId: string) {
  try {
    // 1. Create Batches, Plans, and Trainers in parallel
    const [batchesRes, plansRes, trainersRes] = await Promise.all([
      supabase.from('batches').insert([
        { gym_id: gymId, batch_name: 'Morning Warriors', start_time: '06:00', end_time: '08:00', is_active: true },
        { gym_id: gymId, batch_name: 'Evening Elite', start_time: '18:00', end_time: '20:00', is_active: true }
      ]).select(),
      supabase.from('plans').insert([
        { gym_id: gymId, plan_name: 'Monthly Basic', plan_type: 'Monthly', amount: 30, duration_type: 'Month', duration_value: 1 },
        { gym_id: gymId, plan_name: 'Annual Pro', plan_type: 'Yearly', amount: 300, duration_type: 'Year', duration_value: 1 }
      ]).select(),
      supabase.from('trainers').insert([
        { gym_id: gymId, name: 'Coach Alex', phone: '9876543210', status: 'Active' },
        { gym_id: gymId, name: 'Coach Sarah', phone: '9876543211', status: 'Active' }
      ]).select()
    ]);

    const plans = plansRes.data;
    if (!plans || plans.length === 0) return true;

    // 2. Create Members
    const membersData = [
      { gym_id: gymId, name: 'John Doe', phone: '1112223334', status: 'Active', joining_date: format(subMonths(new Date(), 2), 'yyyy-MM-dd') },
      { gym_id: gymId, name: 'Jane Smith', phone: '5556667778', status: 'Active', joining_date: format(subDays(new Date(), 15), 'yyyy-MM-dd') },
      { gym_id: gymId, name: 'Mike Ross', phone: '9998887776', status: 'Active', joining_date: format(subDays(new Date(), 5), 'yyyy-MM-dd') }
    ];

    const { data: members } = await supabase.from('members').insert(membersData).select();
    if (!members) return true;

    // 3. Create Payments & Member Plans in parallel (per member)
    const paymentPromises = members.map(async (member) => {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const { data: memberPlan } = await supabase.from('member_plans').insert([{
        member_id: member.id,
        plan_id: plan.id,
        purchase_date: member.joining_date,
        start_date: member.joining_date,
        expiry_date: format(subDays(new Date(), -30), 'yyyy-MM-dd'),
        amount: plan.amount,
        paid_amount: plan.amount,
        due_amount: 0,
        status: 'Active'
      }]).select().single();

      if (memberPlan) {
        return supabase.from('payments').insert([{
          member_plan_id: memberPlan.id,
          member_id: member.id,
          amount: plan.amount,
          payment_date: member.joining_date,
          payment_mode: 'Cash'
        }]);
      }
    });

    // 4. Create Visitors
    const visitorsPromise = supabase.from('visitors').insert([
      { gym_id: gymId, name: 'Casual Guest', phone: '1231231234', purpose: 'Trial', status: 'Completed', created_at: subDays(new Date(), 1).toISOString() },
      { gym_id: gymId, name: 'Business Meet', phone: '3213214321', purpose: 'Meeting', status: 'In Progress', created_at: new Date().toISOString() }
    ]);

    await Promise.allSettled([...paymentPromises, visitorsPromise]);

    return true;
  } catch (error: any) {
    console.error('Seeding error:', error);
    // Return true anyway so registration doesn't block on seed errors
    return true;
  }
}
