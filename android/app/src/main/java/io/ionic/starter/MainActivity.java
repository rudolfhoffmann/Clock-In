package io.ionic.starter;

import com.getcapacitor.BridgeActivity;

/*
* Don't use init method in capacitor 3.
* Capacitor 3 allows android plugins to auto register,
* but for that you need to remove the init method from
* MainActivity.java, if it's there the automatic registration
* won't work as init is the legacy way of registering plugins.
*
* 2 ways to solve.
* 1) Remove the init method from MainActivity.java as explained
* on the capacitor 3 updating docs
* 2) Keep the legacy init method and add plugins as you did on
* Capacitor 2. I.E. add(DatepickPlugin.class);
* */

/*import com.getcapacitor.Plugin;

import java.util.ArrayList;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;
import android.os.Bundle;
*/

public class MainActivity extends BridgeActivity {
  /*
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
      // Additional plugins you've installed go here
      add(GoogleAuth.class);
    }});
  }
  */
}
