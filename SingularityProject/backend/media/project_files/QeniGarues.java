
import java.util.Random;

public class QeniGarues extends KafshaGaruese implements Garon {
    public int distanca = 0;
    
    public QeniGarues(int m, String e, int p) throws Exception{
         super(m,e,p);
        if(m < 1 || m > 10){
            throw new Exception("Mosha duhet te plotesohet");
        }
    }
    
    
    @Override
    public void vrapon() {
      distanca += 10;
      System.out.println(toString());
    }
    
    @Override
    public void run(){
        Random r = new Random();
        while(distanca < GJATESIA_PISTES){
            try{
                Thread.sleep(r.nextInt(2000));
                vrapon();
            }
            catch(Exception e){
                System.out.println(e);
            }
            if(distanca == GJATESIA_PISTES){
                System.out.println("====Finish==== " + toString());
            }
        }
    }
    
    public String toString(){
        return "(QeniGarues)" + super.toString() + " vrapo " + distanca + " metra";
    }
    
}
